/**返回最小堆堆顶元素 */
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
    siftUp(heap, node, index);
}

/**往上调整最小堆 */
function siftUp(heap, node, i) {
    let index = i;
    while (index > 0) {
        const parentIndex = (index - 1) >> 1;
        const parent = heap[parentIndex];
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
    const first = heap[0];
    const last = heap.pop();
    if (first !== last) {
        //因为最小堆里的都是对象，当两个对象相同时，就是同一个地址
        heap[0] = last;
        siftDown(heap, last, 0);
    }
    return first;
}

/**向下调整 */
function siftDown(heap, node, i) {
    let index = i;
    const len = heap.length;
    const halfLen = len >> 1;

    while (index < halfLen) {
        const leftIndex = (index + 1) * 2 - 1;
        const rightIndex = leftIndex + 1;
        const left = heap[leftIndex];
        const right = heap[rightIndex];

        if (compare(left, node) < 0) {
            //left < nodex
            //? left、right比较
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
            // parent 最小
            return;
        }
    }
}

function compare(a, b) {
    const diff = a.sortTime - b.sortTime;
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
