import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from "@ton/core";

export const Opcodes = {
  createTask: 1,
  completeTask: 2,
  claimReward: 3,
};

export interface TaskData {
  creator: Address;
  task_id: number;
  maxParticipants: number;
  totalReward: bigint;
  rewardPerParticipant: bigint;
  description: Cell;
  isActive: boolean;
  currentParticipants: number;
}

export interface TaskConfig {
  // Initial empty config for a new contract
}

export function taskConfigToCell(config: TaskConfig): Cell {
  return beginCell().storeUint(0, 32).storeDict(null).storeDict(null).endCell();
}

export class Task implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Task(address);
  }

  static createFromConfig(config: TaskConfig, code: Cell, workchain = 0) {
    const data = taskConfigToCell(config);
    const init = { code, data };
    return new Task(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendCreateTask(
    provider: ContractProvider,
    via: Sender,
    opts: {
      maxParticipants: number;
      description: string;
      rewardAmount: bigint;
      queryID?: number;
    }
  ): Promise<number> {
    const currentCounter = await this.getTaskCounter(provider);
    const descriptionCell = beginCell()
      .storeStringTail(opts.description)
      .endCell();

    await provider.internal(via, {
      value: toNano(opts.rewardAmount) + toNano("0.1"), // Add extra for gas
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.createTask, 32)
        .storeUint(opts.maxParticipants, 32)
        .storeRef(descriptionCell)
        .endCell(),
    });

    return currentCounter + 1;
  }

  async sendCompleteTask(
    provider: ContractProvider,
    via: Sender,
    opts: {
      taskId: number;
      participantAddress: Address;
    }
  ): Promise<void> {
    await provider.internal(via, {
      value: toNano("0.1"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.completeTask, 32)
        .storeUint(opts.taskId, 32)
        .storeAddress(opts.participantAddress)
        .endCell(),
    });
  }
  async sendClaimReward(
    provider: ContractProvider,
    via: Sender,
    opts: {
      taskId: number;
    }
  ): Promise<void> {
    await provider.internal(via, {
      value: toNano("0.1"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.claimReward, 32)
        .storeUint(opts.taskId, 32)
        .endCell(),
    });
  }

  async getTaskCounter(provider: ContractProvider): Promise<number> {
    const { stack } = await provider.get("get_task_counter", []);
    return stack.readNumber();
  }

  async getTask(provider: ContractProvider, taskId: number): Promise<TaskData> {
    const result = await provider.get("get_task", [
      { type: "int", value: BigInt(taskId) },
    ]);
    const stack = result.stack;
    return {
      creator: stack.readAddress(),
      task_id: stack.readNumber(),
      maxParticipants: stack.readNumber(),
      totalReward: stack.readBigNumber(),
      rewardPerParticipant: stack.readBigNumber(),
      description: stack.readCell(),
      isActive: stack.readBoolean(),
      currentParticipants: stack.readNumber(),
    };
  }

  async getAvailableTasks(provider: ContractProvider): Promise<Cell> {
    const result = await provider.get("get_available_tasks", []);
    return result.stack.readCell();
  }

  async hasCompletedTask(
    provider: ContractProvider,
    address: Address,
    taskId: number
  ): Promise<boolean> {
    const result = await provider.get("has_completed_task", [
      { type: "slice", cell: beginCell().storeAddress(address).endCell() },
      { type: "int", value: BigInt(taskId) },
    ]);
    return result.stack.readBoolean();
  }
}
