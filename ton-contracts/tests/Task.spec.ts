import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import { Task } from '../wrappers/Task';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Task', () => {
    let code: Cell;
    let blockchain: Blockchain;
    let task: SandboxContract<Task>;
    let deployer: SandboxContract<TreasuryContract>;
    let user1: SandboxContract<TreasuryContract>;
    let user2: SandboxContract<TreasuryContract>;
    let user3: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('Task');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        user1 = await blockchain.treasury('user1');
        user2 = await blockchain.treasury('user2');
        user3 = await blockchain.treasury('user3');

        task = blockchain.openContract(
            await Task.createFromConfig({}, code)
        );

        const deployResult = await task.sendDeploy(deployer.getSender(), toNano('1'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task.address,
            success: true,
        });
    });

    it('should create a task successfully', async () => {
        const maxParticipants = 3;
        const description = 'Test Task';
        const reward = toNano('3'); // 3 TON

        const createResult = await task.sendCreateTask(
            user1.getSender(),
            {
                maxParticipants,
                description,
                reward
            }
        );

        expect(createResult.transactions).toHaveTransaction({
            from: user1.address,
            to: task.address,
            success: true,
        });

        // Get the task details and verify
        const taskData = await task.getTask(1);
        expect(taskData.creator.toString()).toEqual(user1.address.toString());
        expect(taskData.maxParticipants).toBe(maxParticipants);
        expect(taskData.reward).toBe(toNano('1')); // Reward per participant (3 TON / 3 participants)
        expect(taskData.isActive).toBe(true);
        expect(taskData.currentParticipants).toBe(0);
    });

    it('should complete task only by creator', async () => {
        // Create task first
        await task.sendCreateTask(
            user1.getSender(),
            {
                maxParticipants: 3,
                description: 'Test Task',
                reward: toNano('3')
            }
        );
    
        // Ensure the transaction is processed
        await blockchain.treasury('intermediary');
    
        // Try completing task as non-creator (should fail)
        const failedComplete = await task.sendCompleteTask(
            user2.getSender(),
            {
                taskId: 1,
                participantAddress: user2.address
            }
        );
    
        expect(failedComplete.transactions).toHaveTransaction({
            from: user2.address,
            to: task.address,
            success: false,
            exitCode: 401
        });
    
        // Complete task as creator (should succeed)
        const successComplete = await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user2.address
            }
        );
    
        expect(successComplete.transactions).toHaveTransaction({
            from: user1.address,
            to: task.address,
            success: true,
        });
    
        // Verify completion
        // const isCompleted = await task.hasCompletedTask(task.provider, user2.address, 1); // Pass provider here
        // expect(isCompleted).toBe(true);
    });

    it('should allow claiming rewards for completed tasks', async () => {
        // Create task with sufficient reward
        await task.sendCreateTask(
            user1.getSender(),
            {
                maxParticipants: 3,
                description: 'Test Task',
                reward: toNano('3')
            }
        );

        // Complete the task
        await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user2.address
            }
        );

        // Ensure the complete transaction is processed
        await blockchain.treasury('intermediary');

        const initialBalance = await user2.getBalance();

        // Claim reward
        const claimResult = await task.sendClaimReward(
            user2.getSender(),
            {
                taskId: 1
            }
        );

        expect(claimResult.transactions).toHaveTransaction({
            from: user2.address,
            to: task.address,
            success: true,
        });

        const finalBalance = await user2.getBalance();
        expect(finalBalance).toBeGreaterThan(initialBalance);
    });

    it('should enforce max participants limit', async () => {
        // Create task with max 2 participants
        await task.sendCreateTask(
            user1.getSender(),
            {
                maxParticipants: 2,
                description: 'Test Task',
                reward: toNano('2')
            }
        );

        // Complete for first user
        await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user2.address
            }
        );

        // Ensure first completion is processed
        await blockchain.treasury('intermediary');

        // Complete for second user
        await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user3.address
            }
        );

        // Ensure second completion is processed
        await blockchain.treasury('intermediary');

        // Try to complete for third user (should fail)
        const user4 = await blockchain.treasury('user4');
        const failedComplete = await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user4.address
            }
        );

        expect(failedComplete.transactions).toHaveTransaction({
            from: user1.address,
            to: task.address,
            success: false,
            exitCode: 405
        });
    });

    it('should divide reward equally among all participants', async () => {
        // Create a task with 2 participants and a total reward of 2 TON
        await task.sendCreateTask(
            user1.getSender(),
            {
                maxParticipants: 2,
                description: 'Test Task',
                reward: toNano('2') // 2 TON
            }
        );

        // Complete the task for the first participant
        await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user2.address
            }
        );

        // Complete the task for the second participant
        await task.sendCompleteTask(
            user1.getSender(),
            {
                taskId: 1,
                participantAddress: user3.address
            }
        );

        // Claim reward for the first participant
        const initialBalanceUser2 = await user2.getBalance();
        await task.sendClaimReward(
            user2.getSender(),
            {
                taskId: 1
            }
        );
        const finalBalanceUser2 = await user2.getBalance();
        expect(finalBalanceUser2).toBeGreaterThan(initialBalanceUser2);

        // Claim reward for the second participant
        const initialBalanceUser3 = await user3.getBalance();
        await task.sendClaimReward(
            user3.getSender(),
            {
                taskId: 1
            }
        );
        const finalBalanceUser3 = await user3.getBalance();
        expect(finalBalanceUser3).toBeGreaterThan(initialBalanceUser3);

        // Verify that each participant received 1 TON (2 TON / 2 participants)
        expect(finalBalanceUser2 - initialBalanceUser2).toEqual(toNano('1'));
        expect(finalBalanceUser3 - initialBalanceUser3).toEqual(toNano('1'));
    });
});