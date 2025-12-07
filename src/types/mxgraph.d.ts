/**
 * mxgraph 类型声明文件
 * 为未提供TypeScript支持的mxgraph库提供基础类型定义
 */

declare module 'mxgraph' {
  export class mxGraph {
    constructor(container: HTMLElement);
    getModel(): any;
    getView(): any;
    getStylesheet(): any;
    getDefaultParent(): mxCell;
    insertVertex(
      parent: mxCell | null,
      id: string | null,
      value: string,
      x: number,
      y: number,
      width: number,
      height: number,
      style?: string
    ): mxCell;
    insertEdge(
      parent: mxCell | null,
      id: string | null,
      value: string,
      source: mxCell,
      target: mxCell,
      style?: string
    ): mxCell;
    removeCells(cells: mxCell[]): void;
    setConnectable(connectable: boolean): void;
    setEdgeLabelsMovable(movable: boolean): void;
    setVertexLabelsMovable(movable: boolean): void;
    destroy(): void;
    allowAutoPanning: boolean;
    pageVisible: boolean;
    pageBreaksVisible: boolean;
  }

  export class mxCell {
    getId(): string;
    getValue(): any;
    getGeometry(): mxGeometry | null;
    getStyle(): string;
    getParent(): mxCell | null;
    getSource(): mxCell | null;
    getTarget(): mxCell | null;
    isEdge(): boolean;
    isVertex(): boolean;
    children?: mxCell[];
  }

  export class mxGeometry {
    constructor(x?: number, y?: number, width?: number, height?: number);
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export const mxEvent: {
    [key: string]: string;
    disableContextMenu(element: HTMLElement): void;
    addListener(element: HTMLElement, eventName: string, callback: Function): void;
    removeListener(element: HTMLElement, eventName: string, callback: Function): void;
  };

  export const mxUtils: {
    [key: string]: any;
    hasLanguageFile(): boolean;
    loadResources(url: string): void;
    parseXml(xml: string): Document;
    getXml(node: Node): string;
  };

  export class mxCodec {
    encode(obj: any): Node;
  }

  export class mxUndoManager {
    constructor();
    undoableEditHappened(edit: any): void;
    undo(): void;
    redo(): void;
  }
}
