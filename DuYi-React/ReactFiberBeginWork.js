//在 beginWork 中，主要是根据fiber不同tag值，调用不同的方法处理
import {
  updateHostComponent,
  updateFunctionComponent,
  updateClassComponent,
  updateFragmentComponent,
  updateHostTextComponent,
} from "./ReactReconciler";

import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from "./ReactWorkTags";

export default function beginWork(wip) {
  const { tag } = wip;
  //todo 1.更新当前组件

  switch (tag) {
    case HostComponent:
      updateHostComponent(wip);
      break;
    case FunctionComponent:
      updateFunctionComponent(wip);
      break;
    case ClassComponent:
      updateClassComponent(wip);
      break;
    case Fragment:
      updateFragmentComponent(wip);
      break;
    case HostText:
      updateHostTextComponent(wip);
      break;
    default:
      break;
  }
}