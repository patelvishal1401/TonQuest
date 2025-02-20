// import { beginCell } from '@ton/core';
import { toNano, beginCell } from "@ton/ton";

class TaskContract {
  // Constructor stores the contract address
  constructor(address, creatorAddress) {
    this.address = address; // Storing the contract address
    this.creatorAddress = creatorAddress; // Storing the contract address
  }

  // Method to create a task
  async sendCreateTask(
    provider,
    via,
    maxParticipants,
    rewardAmount,
    description
  ) {
    console.log({ provider, via, maxParticipants, rewardAmount, description });

    const messageBody = beginCell()
      .storeUint(1, 64) // Operation code for creating a task
      .storeUint(Number(maxParticipants), 64)
      .storeAddress(this.creatorAddress)
      .storeCoins(toNano(rewardAmount))
      .storeBuffer(Buffer.from(description, "utf-8"))
      .endCell();

    // Interact with the contract at the specified address
    return await provider.internal(via, {
      to: this.address, // Use the contract's address
      value: toNano("0.02"), // Example of TON value for creating a task (adjust as needed)
      bounce: false,
      body: messageBody,
    });
  }

  // Method to complete a task
  async sendCompleteTask(provider, via, taskId, participantAddress) {
    const messageBody = beginCell()
      .storeUint(2, 32) // Operation code for completing a task
      .storeUint(Number(taskId), 32)
      .storeAddress(participantAddress)
      .endCell();

    // Interact with the contract at the specified address
      return  await provider.internal(via, {
      to: this.address, // Use the contract's address
      value: toNano("0.02"), // Example of TON value for completing a task (adjust as needed)
      bounce: false,
      body: messageBody,
    });
  }

  // Method to claim a reward
  async sendClaimReward(provider, via, taskId) {
    const messageBody = beginCell()
      .storeUint(3, 32) // Operation code for claiming a reward
      .storeUint(Number(taskId), 32)
      .endCell();

    // Interact with the contract at the specified address
      return await provider.internal(via, {
      to: this.address, // Use the contract's address
      value: toNano("0.02"), // Example of TON value for claiming a reward (adjust as needed)
      bounce: false,
      body: messageBody,
    });
  }

  async getAllTasks(provider) {
    try {
      console.log(provider);

      const response = await provider.get("get_available_tasks", []);
      console.log("Raw Response:", JSON.stringify(response, null, 2));

      if (!response) {
        throw new Error("Failed to fetch tasks from contract.");
      }
      console.log(response.stack.readCell());

      return response.tasks.map((task) => ({
        taskId: task[0], // Assuming task ID is the first field
        creatorAddress: task[1], // Creator's address
        maxParticipants: task[2], // Max participants allowed
        rewardPerParticipant: task[3], // Reward per participant
        description: task[4].toString("utf-8"), // Convert description from buffer
        isActive: task[5] === 1, // Convert boolean flag
        currentParticipants: task[6], // Current participants count
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }
}

export default TaskContract;
