import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import { Task } from '../wrappers/Task';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Task', () => {
    let code: Cell;
    let blockchain: Blockchain;
    let task: SandboxContract<Task>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('Task');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        
        task = blockchain.openContract(
            Task.createFromConfig({}, code)
        );
        
        deployer = await blockchain.treasury('deployer');
        
        const deployResult = await task.sendDeploy(deployer.getSender(), toNano('0.05'));
        
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
    });

    it('should create a task successfully', async () => {
        const creator = await blockchain.treasury('creator');
        const maxParticipants = 3;
        const description = 'Test Task';
        const rewardAmount = toNano('3'); // 3 TON
        
        const createResult = await task.sendCreateTask(
            creator.getSender(),
            {
                maxParticipants,
                description,
                rewardAmount,
            }
        );
    
        expect(createResult.transactions).toHaveTransaction({
            from: creator.address,
            to: task.address,
            success: true,
        });
    
        const taskData = await task.getTask(1);
        expect(taskData.creator.toString()).toEqual(creator.address.toString());
        expect(taskData.maxParticipants).toBe(maxParticipants);
        expect(taskData.task_id).toBe(1);
        // expect(taskData.totalReward).toBe(rewardAmount);
        // expect(taskData.rewardPerParticipant).toBe(rewardAmount / BigInt(maxParticipants));
        expect(taskData.isActive).toBe(true);
        expect(taskData.currentParticipants).toBe(0);
    });

    it('should complete task only by creator', async () => {
        // Create task first
        const creator = await blockchain.treasury('creator');
        const user = await blockchain.treasury('user');
        const nonCreator = await blockchain.treasury('nonCreator');
        
        await task.sendCreateTask(
            creator.getSender(),
            {
                maxParticipants: 3,
                description: 'Test Task',
                rewardAmount: toNano('3')
            }
        );

        // Try completing task as non-creator (should fail)
        const failedComplete = await task.sendCompleteTask(
            nonCreator.getSender(),
            {
                taskId: 1,
                participantAddress: user.address
            }
        );

        expect(failedComplete.transactions).toHaveTransaction({
            from: nonCreator.address,
            to: task.address,
            success: false,
            exitCode: 401 // not_creator error
        });

        // Complete task as creator
        const successComplete = await task.sendCompleteTask(
            creator.getSender(),
            {
                taskId: 1,
                participantAddress: user.address
            }
        );

        // Verify success
        expect(successComplete.transactions).toHaveTransaction({
            from: creator.address,
            to: task.address,
            success: true
        });

        // Verify task state
        const taskData = await task.getTask(1);
        expect(taskData.currentParticipants).toBe(1);
        expect(taskData.isActive).toBe(true);
        
        // Verify completion status
        // const hasCompleted = await task.hasCompletedTask(user.address, 1);
        // expect(hasCompleted).toBe(true);
    });

    it('should allow claiming rewards for completed tasks', async () => {
        const creator = await blockchain.treasury('creator');
        const participant = await blockchain.treasury('participant');
        const rewardAmount = toNano('3');
        const maxParticipants = 3;

        // Create task
        await task.sendCreateTask(
            creator.getSender(),
            {
                maxParticipants,
                description: 'Test Task',
                rewardAmount
            }
        );

        // Complete the task
        await task.sendCompleteTask(
            creator.getSender(),
            {
                taskId: 1,
                participantAddress: participant.address
            }
        );

        const initialBalance = await participant.getBalance();

        // Claim reward
        const claimResult = await task.sendClaimReward(
            participant.getSender(),
            {
                taskId: 1
            }
        );

        expect(claimResult.transactions).toHaveTransaction({
            from: participant.address,
            to: task.address,
            success: true
        });

        const finalBalance = await participant.getBalance();
        const expectedReward = rewardAmount / BigInt(maxParticipants);
        
        // Account for gas costs in balance check
        expect(finalBalance - initialBalance).toBeGreaterThanOrEqual(expectedReward - toNano('0.15'));
    });

    it('should divide reward equally among all participants', async () => {
        const creator = await blockchain.treasury('creator');
        const participant1 = await blockchain.treasury('participant1');
        const participant2 = await blockchain.treasury('participant2');
        const rewardAmount = toNano('2'); // 2 TON total reward
        const maxParticipants = 2;

        // Create task
        await task.sendCreateTask(
            creator.getSender(),
            {
                maxParticipants,
                description: 'Test Task',
                rewardAmount
            }
        );

        // Complete task for both participants
        await task.sendCompleteTask(
            creator.getSender(),
            {
                taskId: 1,
                participantAddress: participant1.address
            }
        );

        await task.sendCompleteTask(
            creator.getSender(),
            {
                taskId: 1,
                participantAddress: participant2.address
            }
        );

        // Claim rewards and check balances
        const initialBalance1 = await participant1.getBalance();
        await task.sendClaimReward(
            participant1.getSender(),
            {
                taskId: 1
            }
        );
        const finalBalance1 = await participant1.getBalance();

        const initialBalance2 = await participant2.getBalance();
        await task.sendClaimReward(
            participant2.getSender(),
            {
                taskId: 1
            }
        );
        const finalBalance2 = await participant2.getBalance();

        const expectedReward = rewardAmount / BigInt(maxParticipants); // 1 TON each
        // Account for gas costs in balance checks
        expect(finalBalance1 - initialBalance1).toBeGreaterThanOrEqual(expectedReward - toNano('0.15'));
        expect(finalBalance2 - initialBalance2).toBeGreaterThanOrEqual(expectedReward - toNano('0.15'));
    });
});