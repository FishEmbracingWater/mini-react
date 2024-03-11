/**返回最小堆堆顶元素
 * @param {Array} heap 任务队列
 */
export function peek(heap) {
    return heap.length === 0 ? null : heap[0];
}

/**往堆中插入一个元素
 * 1.将元素插入到堆的末尾
 * 2.往上调整最小堆，将元素与父节点比较，如果比父节点小，则交换位置
 */
export function push(heap, node) {
    const index = heap.length;
    heap.push(node);
    // 将当前任务进行上浮操作，使其在合适的位置
    siftUp(heap, node, index);
}

/**往上调整最小堆
 * @param {Array} heap 任务队列
 * @param {Object} node 当前推入的任务
 * @param {Number} i 任务队列的长度
 */
function siftUp(heap, node, i) {
    let index = i; //index 保存的也就是当前任务队列的长度
    while (index > 0) {
        //每右移一位，相当于除以2，每左移一位，相当于乘以2
        //这里 /2 是为了获取父节点的索引
        const parentIndex = (index - 1) >> 1;
        const parent = heap[parentIndex];//获取父节点的任务
        if (compare(parent, node) > 0) {
            //parent>node 不符合最小堆的定义，需要交换位置
            heap[parentIndex] = node;
            heap[index] = parent;
            index = parentIndex;
        } else {
            return;
        }
    }
}

/**删除堆顶元素
 * 1.最后一个元素覆盖堆顶
 * 2.往下调整最小堆，将元素与子节点比较，如果比子节点大，则交换位置
 */
export function pop(heap) {
    if (heap.length === 0) {
        return null;
    }
    //先取出堆顶的任务
    const first = heap[0];
    //取出堆的最后一个任务
    const last = heap.pop();
    if (first !== last) {
        //进入此if，说明任务队列里面的任务数大于1
        //因为最小堆里的都是对象，当两个对象相同时，就是同一个地址
        heap[0] = last; //将最后一个任务放到堆顶
        //但是该任务可能不在合适的位置，因此需要进行下沉操作
        siftDown(heap, last, 0);
    }
    return first;
}

/**向下调整
 * @param {Array} heap 任务队列
 * @param {Object} node 之前的最后一个任务，但是现在已经被放置在堆顶了
 * @param {Number} i 该任务的下标，也就是0
 */
function siftDown(heap, node, i) {
    //记录当前任务的下标，也就是从0开始
    let index = i;
    const len = heap.length;
    //获取当前任务队列一半的索引,也就是它左子节点的下标
    const halfLen = len >> 1;
    //因为使用的是数组来实现二叉树，所以数组不能越界
    //因为是二叉树，所以比较左树或者右数
    while (index < halfLen) {
        //获得左子节点的下标
        const leftIndex = (index + 1) * 2 - 1;
        const rightIndex = leftIndex + 1;
        //左右节点的索引有了，可以得到左右节点的任务
        const left = heap[leftIndex];
        const right = heap[rightIndex];

        if (compare(left, node) < 0) {
            //如果进入此分支，说明左边的过期时间更紧急
            //left < nodex
            //? left、right比较，谁小才能上去
            //为什么要做 rightIndex < len 的判断呢？
            //因为有可能只有左节点，没有右节点
            if (rightIndex < len && compare(right, left) < 0) {
                //right 最小，交换right和parent
                heap[index] = right;
                heap[rightIndex] = node;
                index = rightIndex;
            } else {
                //没有right或者left <left
                //交换left和parent
                heap[index] = left;
                heap[leftIndex] = node;
                index = leftIndex;
            }
        } else if (rightIndex < len && compare(right, node) < 0) {
            //right 最小，交换right 和parent
            heap[index] = right;
            heap[rightIndex] = node;
            index = rightIndex;
        } else {
            // 当前的 parent 最小
            return;
        }
    }
}

function compare(a, b) {
    const diff = a.sortTime - b.sortTime;
    //如果通过过期时间比较不出来先后，就通过id来比较
    return diff !== 0 ? diff : a.id - b.id;
}

// const a = [3, 7, 4, 10, 12, 9, 6, 15, 14];

// push(a, 8);

// while (1) {
//     if (a.length === 0) {
//         break;
//     }
//     console.log("a", peek(a)); //sy-log
//     pop(a);
// }
