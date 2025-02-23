import { PromiseQueue } from '@app/lib/PromiseQueue';

describe('@app/lib/PromiseQueue', () => {
  it('should execute tasks concurrently up to the concurrency limit', async () => {
    const queue = new PromiseQueue(3);
    const running: number[] = [];
    const completed: number[] = [];

    const createTask = (id: number) => async () => {
      running.push(id);
      await new Promise((resolve) => setTimeout(resolve, 100));
      running.splice(running.indexOf(id), 1);
      completed.push(id);
      return id;
    };

    const tasks = [1, 2, 3, 4, 5].map((id) => queue.add(createTask(id)));

    expect(queue.getPendingLength()).toBe(3);
    expect(queue.getQueueLength()).toBe(2);
    expect(running.length).toBeLessThanOrEqual(3);

    const results = await Promise.all(tasks);
    expect(results).toEqual([1, 2, 3, 4, 5]);
    expect(completed).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle errors properly', async () => {
    const queue = new PromiseQueue(2);
    const errorMessage = 'Test error';

    const successTask = async () => 'success';
    const failTask = async () => {
      throw new Error(errorMessage);
    };

    const successPromise = queue.add(successTask);
    const failPromise = queue.add(failTask);

    await expect(successPromise).resolves.toBe('success');
    await expect(failPromise).rejects.toThrow(errorMessage);
  });

  it('should process queued tasks after completing running tasks', async () => {
    const queue = new PromiseQueue(1);
    const order: number[] = [];

    const createTask = (id: number, delay: number) => async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      order.push(id);
      return id;
    };

    const task1 = queue.add(createTask(1, 200));
    const task2 = queue.add(createTask(2, 100));

    expect(queue.getPendingLength()).toBe(1);
    expect(queue.getQueueLength()).toBe(1);

    await Promise.all([task1, task2]);

    expect(order).toEqual([1, 2]);
    expect(queue.getPendingLength()).toBe(0);
    expect(queue.getQueueLength()).toBe(0);
  });
});
