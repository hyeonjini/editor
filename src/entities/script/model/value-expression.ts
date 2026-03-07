export interface ValueSelector {
  nodeId: string;
  sourceType: "request-response" | "request-binding" | "data-node";
  path: string;
}

export interface StaticValueExpression {
  kind: "static";
  value: string;
}

export interface ReferenceValueExpression {
  kind: "reference";
  selector: ValueSelector;
}

export interface TemplateValueExpression {
  kind: "template";
  template: string;
  references: ValueSelector[];
}

export type ValueExpression =
  | StaticValueExpression
  | ReferenceValueExpression
  | TemplateValueExpression;
