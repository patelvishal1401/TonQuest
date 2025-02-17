import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type TaskConfig = {};

export function taskConfigToCell(config: TaskConfig): Cell {
    return beginCell().endCell();
}

export class Task implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

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
            reward: bigint;
        }
    ) {
        const descriptionCell = beginCell().storeStringTail(opts.description).endCell();
        
        await provider.internal(via, {
            value: opts.reward,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32) // op::create_task
                .storeUint(opts.maxParticipants, 32)
                .storeCoins(opts.reward)
                .storeRef(descriptionCell)
                .endCell(),
        });
    }

    async sendCompleteTask(
        provider: ContractProvider,
        via: Sender,
        opts: {
            taskId: number;
            participantAddress: Address;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.5'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32) // op::complete_task
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
    ) {
        await provider.internal(via, {
            value: toNano('0.3'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(3, 32) // op::claim_reward
                .storeUint(opts.taskId, 32)
                .endCell(),
        });
    }

    async getTask(provider: ContractProvider, taskId: number) {
        const result = await provider.get('get_task', [
            { type: 'int', value: BigInt(taskId) }
        ]);
        const stack = result.stack;
        return {
            creator: stack.readAddress(),
            maxParticipants: stack.readNumber(),
            reward: stack.readBigNumber(),
            description: stack.readCell(),
            isActive: stack.readNumber() === 1,
            currentParticipants: stack.readNumber()
        };
    }

    async getAvailableTasks(provider: ContractProvider) {
        const result = await provider.get('get_available_tasks', []);
        return result.stack.readCell();
    }

    async hasCompletedTask(provider: ContractProvider, address: Address, taskId: number) {
        const result = await provider.get('has_completed_task', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
            { type: 'int', value: BigInt(taskId) }
        ]);
        return result.stack.readNumber() === 1;
    }
}