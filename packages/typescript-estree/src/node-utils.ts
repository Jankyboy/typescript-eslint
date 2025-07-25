import * as ts from 'typescript';

import type { TSESTree, TSNode } from './ts-estree';

import { getModifiers } from './getModifiers';
import { xhtmlEntities } from './jsx/xhtml-entities';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from './ts-estree';
import { typescriptVersionIsAtLeast } from './version-check';

const isAtLeast50 = typescriptVersionIsAtLeast['5.0'];

const SyntaxKind = ts.SyntaxKind;

type LogicalOperatorKind =
  | ts.SyntaxKind.AmpersandAmpersandToken
  | ts.SyntaxKind.BarBarToken
  | ts.SyntaxKind.QuestionQuestionToken;
const LOGICAL_OPERATORS: ReadonlySet<LogicalOperatorKind> = new Set([
  SyntaxKind.AmpersandAmpersandToken,
  SyntaxKind.BarBarToken,
  SyntaxKind.QuestionQuestionToken,
]);

interface TokenToText
  extends TSESTree.PunctuatorTokenToText,
    TSESTree.BinaryOperatorToText {
  [SyntaxKind.ImportKeyword]: 'import';
  [SyntaxKind.KeyOfKeyword]: 'keyof';
  [SyntaxKind.NewKeyword]: 'new';
  [SyntaxKind.ReadonlyKeyword]: 'readonly';
  [SyntaxKind.UniqueKeyword]: 'unique';
}

type AssignmentOperatorKind = keyof TSESTree.AssignmentOperatorToText;
const ASSIGNMENT_OPERATORS: ReadonlySet<AssignmentOperatorKind> = new Set([
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
]);

type BinaryOperatorKind = keyof TSESTree.BinaryOperatorToText;
const BINARY_OPERATORS: ReadonlySet<BinaryOperatorKind> = new Set([
  SyntaxKind.AmpersandAmpersandToken,
  SyntaxKind.AmpersandToken,
  SyntaxKind.AsteriskAsteriskToken,
  SyntaxKind.AsteriskToken,
  SyntaxKind.BarBarToken,
  SyntaxKind.BarToken,
  SyntaxKind.CaretToken,
  SyntaxKind.EqualsEqualsEqualsToken,
  SyntaxKind.EqualsEqualsToken,
  SyntaxKind.ExclamationEqualsEqualsToken,
  SyntaxKind.ExclamationEqualsToken,
  SyntaxKind.GreaterThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanGreaterThanToken,
  SyntaxKind.GreaterThanGreaterThanToken,
  SyntaxKind.GreaterThanToken,
  SyntaxKind.InKeyword,
  SyntaxKind.InstanceOfKeyword,
  SyntaxKind.LessThanEqualsToken,
  SyntaxKind.LessThanLessThanToken,
  SyntaxKind.LessThanToken,
  SyntaxKind.MinusToken,
  SyntaxKind.PercentToken,
  SyntaxKind.PlusToken,
  SyntaxKind.SlashToken,
]);

type DeclarationKind = TSESTree.VariableDeclaration['kind'];

/**
 * Returns true if the given ts.Token is the assignment operator
 */
function isAssignmentOperator(
  operator: ts.BinaryOperatorToken,
): operator is ts.Token<AssignmentOperatorKind> {
  return (ASSIGNMENT_OPERATORS as ReadonlySet<ts.SyntaxKind>).has(
    operator.kind,
  );
}

/**
 * Returns true if the given ts.Token is a logical operator
 */
export function isLogicalOperator(
  operator: ts.BinaryOperatorToken,
): operator is ts.Token<LogicalOperatorKind> {
  return (LOGICAL_OPERATORS as ReadonlySet<ts.SyntaxKind>).has(operator.kind);
}

export function isESTreeBinaryOperator(
  operator: ts.BinaryOperatorToken,
): operator is ts.Token<BinaryOperatorKind> {
  return (BINARY_OPERATORS as ReadonlySet<ts.SyntaxKind>).has(operator.kind);
}

type TokenForTokenKind<T extends ts.SyntaxKind> = T extends keyof TokenToText
  ? TokenToText[T]
  : string | undefined;
/**
 * Returns the string form of the given TSToken SyntaxKind
 */
export function getTextForTokenKind<T extends ts.SyntaxKind>(
  kind: T,
): TokenForTokenKind<T> {
  return ts.tokenToString(kind) as T extends keyof TokenToText
    ? TokenToText[T]
    : string | undefined;
}

/**
 * Returns true if the given ts.Node is a valid ESTree class member
 */
export function isESTreeClassMember(node: ts.Node): boolean {
  return node.kind !== SyntaxKind.SemicolonClassElement;
}

/**
 * Checks if a ts.Node has a modifier
 */
export function hasModifier(
  modifierKind: ts.KeywordSyntaxKind,
  node: ts.Node,
): boolean {
  const modifiers = getModifiers(node);
  return modifiers?.some(modifier => modifier.kind === modifierKind) === true;
}

/**
 * Get last last modifier in ast
 * @returns returns last modifier if present or null
 */
export function getLastModifier(node: ts.Node): ts.Modifier | null {
  const modifiers = getModifiers(node);
  if (modifiers == null) {
    return null;
  }
  return modifiers[modifiers.length - 1] ?? null;
}

/**
 * Returns true if the given ts.Token is a comma
 */
export function isComma(
  token: ts.Node,
): token is ts.Token<ts.SyntaxKind.CommaToken> {
  return token.kind === SyntaxKind.CommaToken;
}

/**
 * Returns true if the given ts.Node is a comment
 */
export function isComment(node: ts.Node): boolean {
  return (
    node.kind === SyntaxKind.SingleLineCommentTrivia ||
    node.kind === SyntaxKind.MultiLineCommentTrivia
  );
}

/**
 * Returns true if the given ts.Node is a JSDoc comment
 */
function isJSDocComment(node: ts.Node): node is ts.JSDoc {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- SyntaxKind.JSDoc was only added in TS4.7 so we can't use it yet
  return node.kind === SyntaxKind.JSDocComment;
}

/**
 * Returns the binary expression type of the given ts.Token
 */
export function getBinaryExpressionType(operator: ts.BinaryOperatorToken):
  | {
      operator: TokenForTokenKind<AssignmentOperatorKind>;
      type: AST_NODE_TYPES.AssignmentExpression;
    }
  | {
      operator: TokenForTokenKind<BinaryOperatorKind>;
      type: AST_NODE_TYPES.BinaryExpression;
    }
  | {
      operator: TokenForTokenKind<LogicalOperatorKind>;
      type: AST_NODE_TYPES.LogicalExpression;
    } {
  if (isAssignmentOperator(operator)) {
    return {
      type: AST_NODE_TYPES.AssignmentExpression,
      operator: getTextForTokenKind(operator.kind),
    };
  }

  if (isLogicalOperator(operator)) {
    return {
      type: AST_NODE_TYPES.LogicalExpression,
      operator: getTextForTokenKind(operator.kind),
    };
  }

  if (isESTreeBinaryOperator(operator)) {
    return {
      type: AST_NODE_TYPES.BinaryExpression,
      operator: getTextForTokenKind(operator.kind),
    };
  }

  throw new Error(
    `Unexpected binary operator ${ts.tokenToString(operator.kind)}`,
  );
}

/**
 * Returns line and column data for the given positions
 */
export function getLineAndCharacterFor(
  pos: number,
  ast: ts.SourceFile,
): TSESTree.Position {
  const loc = ast.getLineAndCharacterOfPosition(pos);
  return {
    column: loc.character,
    line: loc.line + 1,
  };
}

/**
 * Returns line and column data for the given start and end positions,
 * for the given AST
 */
export function getLocFor(
  range: TSESTree.Range,
  ast: ts.SourceFile,
): TSESTree.SourceLocation {
  const [start, end] = range.map(pos => getLineAndCharacterFor(pos, ast));
  return { end, start };
}

/**
 * Check whatever node can contain directive
 */
export function canContainDirective(
  node:
    | ts.Block
    | ts.ClassStaticBlockDeclaration
    | ts.ModuleBlock
    | ts.SourceFile,
): boolean {
  if (node.kind === ts.SyntaxKind.Block) {
    switch (node.parent.kind) {
      case ts.SyntaxKind.Constructor:
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.SetAccessor:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
        return true;
      default:
        return false;
    }
  }
  return true;
}

/**
 * Returns range for the given ts.Node
 */
export function getRange(
  node: Pick<ts.Node, 'getEnd' | 'getStart'>,
  ast: ts.SourceFile,
): [number, number] {
  return [node.getStart(ast), node.getEnd()];
}

/**
 * Returns true if a given ts.Node is a token
 */
function isToken(node: ts.Node): node is ts.Token<ts.TokenSyntaxKind> {
  return (
    node.kind >= SyntaxKind.FirstToken && node.kind <= SyntaxKind.LastToken
  );
}

/**
 * Returns true if a given ts.Node is a JSX token
 */
export function isJSXToken(node: ts.Node): boolean {
  return (
    node.kind >= SyntaxKind.JsxElement && node.kind <= SyntaxKind.JsxAttribute
  );
}

/**
 * Returns the declaration kind of the given ts.Node
 */
export function getDeclarationKind(
  node: ts.VariableDeclarationList,
): DeclarationKind {
  if (node.flags & ts.NodeFlags.Let) {
    return 'let';
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if ((node.flags & ts.NodeFlags.AwaitUsing) === ts.NodeFlags.AwaitUsing) {
    return 'await using';
  }
  if (node.flags & ts.NodeFlags.Const) {
    return 'const';
  }
  if (node.flags & ts.NodeFlags.Using) {
    return 'using';
  }
  return 'var';
}

/**
 * Gets a ts.Node's accessibility level
 */
export function getTSNodeAccessibility(
  node: ts.Node,
): 'private' | 'protected' | 'public' | undefined {
  const modifiers = getModifiers(node);
  if (modifiers == null) {
    return undefined;
  }
  for (const modifier of modifiers) {
    switch (modifier.kind) {
      case SyntaxKind.PublicKeyword:
        return 'public';
      case SyntaxKind.ProtectedKeyword:
        return 'protected';
      case SyntaxKind.PrivateKeyword:
        return 'private';
      default:
        break;
    }
  }
  return undefined;
}

/**
 * Finds the next token based on the previous one and its parent
 * Had to copy this from TS instead of using TS's version because theirs doesn't pass the ast to getChildren
 */
export function findNextToken(
  previousToken: ts.TextRange,
  parent: ts.Node,
  ast: ts.SourceFile,
): ts.Node | undefined {
  return find(parent);

  function find(n: ts.Node): ts.Node | undefined {
    if (ts.isToken(n) && n.pos === previousToken.end) {
      // this is token that starts at the end of previous token - return it
      return n;
    }
    return firstDefined(n.getChildren(ast), (child: ts.Node) => {
      const shouldDiveInChildNode =
        // previous token is enclosed somewhere in the child
        (child.pos <= previousToken.pos && child.end > previousToken.end) ||
        // previous token ends exactly at the beginning of child
        child.pos === previousToken.end;
      return shouldDiveInChildNode && nodeHasTokens(child, ast)
        ? find(child)
        : undefined;
    });
  }
}

/**
 * Find the first matching ancestor based on the given predicate function.
 * @param node The current ts.Node
 * @param predicate The predicate function to apply to each checked ancestor
 * @returns a matching parent ts.Node
 */
export function findFirstMatchingAncestor(
  node: ts.Node,
  predicate: (node: ts.Node) => boolean,
): ts.Node | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent as ts.Node | undefined;
  }
  return undefined;
}

/**
 * Returns true if a given ts.Node has a JSX token within its hierarchy
 */
export function hasJSXAncestor(node: ts.Node): boolean {
  return !!findFirstMatchingAncestor(node, isJSXToken);
}

/**
 * Unescape the text content of string literals, e.g. &amp; -> &
 * @param text The escaped string literal text.
 * @returns The unescaped string literal text.
 */
export function unescapeStringLiteralText(text: string): string {
  return text.replaceAll(/&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+);/g, entity => {
    const item = entity.slice(1, -1);
    if (item[0] === '#') {
      const codePoint =
        item[1] === 'x'
          ? parseInt(item.slice(2), 16)
          : parseInt(item.slice(1), 10);
      return codePoint > 0x10ffff // RangeError: Invalid code point
        ? entity
        : String.fromCodePoint(codePoint);
    }
    return xhtmlEntities[item] || entity;
  });
}

/**
 * Returns true if a given ts.Node is a computed property
 */
export function isComputedProperty(
  node: ts.Node,
): node is ts.ComputedPropertyName {
  return node.kind === SyntaxKind.ComputedPropertyName;
}

/**
 * Returns true if a given ts.Node is optional (has QuestionToken)
 * @param node ts.Node to be checked
 */
export function isOptional(node: {
  questionToken?: ts.QuestionToken;
}): boolean {
  return !!node.questionToken;
}

/**
 * Returns true if the node is an optional chain node
 */
export function isChainExpression(
  node: TSESTree.Node,
): node is TSESTree.ChainExpression {
  return node.type === AST_NODE_TYPES.ChainExpression;
}

/**
 * Returns true of the child of property access expression is an optional chain
 */
export function isChildUnwrappableOptionalChain(
  node:
    | ts.CallExpression
    | ts.ElementAccessExpression
    | ts.NonNullExpression
    | ts.PropertyAccessExpression,
  child: TSESTree.Node,
): boolean {
  return (
    isChainExpression(child) &&
    // (x?.y).z is semantically different, and as such .z is no longer optional
    node.expression.kind !== ts.SyntaxKind.ParenthesizedExpression
  );
}

/**
 * Returns the type of a given ts.Token
 */
export function getTokenType(
  token: ts.Identifier | ts.Token<ts.SyntaxKind>,
): Exclude<AST_TOKEN_TYPES, AST_TOKEN_TYPES.Block | AST_TOKEN_TYPES.Line> {
  if (token.kind === SyntaxKind.NullKeyword) {
    return AST_TOKEN_TYPES.Null;
  }

  if (
    token.kind >= SyntaxKind.FirstKeyword &&
    token.kind <= SyntaxKind.LastFutureReservedWord
  ) {
    if (
      token.kind === SyntaxKind.FalseKeyword ||
      token.kind === SyntaxKind.TrueKeyword
    ) {
      return AST_TOKEN_TYPES.Boolean;
    }

    return AST_TOKEN_TYPES.Keyword;
  }

  if (
    token.kind >= SyntaxKind.FirstPunctuation &&
    token.kind <= SyntaxKind.LastPunctuation
  ) {
    return AST_TOKEN_TYPES.Punctuator;
  }

  if (
    token.kind >= SyntaxKind.NoSubstitutionTemplateLiteral &&
    token.kind <= SyntaxKind.TemplateTail
  ) {
    return AST_TOKEN_TYPES.Template;
  }

  switch (token.kind) {
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.BigIntLiteral:
      return AST_TOKEN_TYPES.Numeric;

    case SyntaxKind.PrivateIdentifier:
      return AST_TOKEN_TYPES.PrivateIdentifier;

    case SyntaxKind.JsxText:
      return AST_TOKEN_TYPES.JSXText;

    case SyntaxKind.StringLiteral:
      // A TypeScript-StringLiteral token with a TypeScript-JsxAttribute or TypeScript-JsxElement parent,
      // must actually be an ESTree-JSXText token
      if (
        token.parent.kind === SyntaxKind.JsxAttribute ||
        token.parent.kind === SyntaxKind.JsxElement
      ) {
        return AST_TOKEN_TYPES.JSXText;
      }

      return AST_TOKEN_TYPES.String;

    case SyntaxKind.RegularExpressionLiteral:
      return AST_TOKEN_TYPES.RegularExpression;

    case SyntaxKind.Identifier:
    case SyntaxKind.ConstructorKeyword:
    case SyntaxKind.GetKeyword:
    case SyntaxKind.SetKeyword:

    // intentional fallthrough
    default:
  }

  // Some JSX tokens have to be determined based on their parent
  if (token.kind === SyntaxKind.Identifier) {
    if (isJSXToken(token.parent)) {
      return AST_TOKEN_TYPES.JSXIdentifier;
    }

    if (
      token.parent.kind === SyntaxKind.PropertyAccessExpression &&
      hasJSXAncestor(token)
    ) {
      return AST_TOKEN_TYPES.JSXIdentifier;
    }
  }

  return AST_TOKEN_TYPES.Identifier;
}

/**
 * Extends and formats a given ts.Token, for a given AST
 */
export function convertToken(
  token: ts.Token<ts.TokenSyntaxKind>,
  ast: ts.SourceFile,
): TSESTree.Token {
  const start =
    token.kind === SyntaxKind.JsxText
      ? token.getFullStart()
      : token.getStart(ast);
  const end = token.getEnd();
  const value = ast.text.slice(start, end);
  const tokenType = getTokenType(token);
  const range: TSESTree.Range = [start, end];
  const loc = getLocFor(range, ast);

  if (tokenType === AST_TOKEN_TYPES.RegularExpression) {
    return {
      type: tokenType,
      loc,
      range,
      regex: {
        flags: value.slice(value.lastIndexOf('/') + 1),
        pattern: value.slice(1, value.lastIndexOf('/')),
      },
      value,
    };
  }

  if (tokenType === AST_TOKEN_TYPES.PrivateIdentifier) {
    return {
      type: tokenType,
      loc,
      range,
      value: value.slice(1),
    };
  }

  // @ts-expect-error TS is complaining about `value` not being the correct
  // type but it is
  return {
    type: tokenType,
    loc,
    range,
    value,
  };
}

/**
 * Converts all tokens for the given AST
 * @param ast the AST object
 * @returns the converted Tokens
 */
export function convertTokens(ast: ts.SourceFile): TSESTree.Token[] {
  const result: TSESTree.Token[] = [];
  /**
   * @param node the ts.Node
   */
  function walk(node: ts.Node): void {
    // TypeScript generates tokens for types in JSDoc blocks. Comment tokens
    // and their children should not be walked or added to the resulting tokens list.
    if (isComment(node) || isJSDocComment(node)) {
      return;
    }

    if (isToken(node) && node.kind !== SyntaxKind.EndOfFileToken) {
      result.push(convertToken(node, ast));
    } else {
      node.getChildren(ast).forEach(walk);
    }
  }
  walk(ast);
  return result;
}

export class TSError extends Error {
  constructor(
    message: string,
    public readonly fileName: string,
    public readonly location: {
      end: {
        column: number;
        line: number;
        offset: number;
      };
      start: {
        column: number;
        line: number;
        offset: number;
      };
    },
  ) {
    super(message);
    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: new.target.name,
    });
  }

  // For old version of ESLint https://github.com/typescript-eslint/typescript-eslint/pull/6556#discussion_r1123237311
  get index(): number {
    return this.location.start.offset;
  }

  // https://github.com/eslint/eslint/blob/b09a512107249a4eb19ef5a37b0bd672266eafdb/lib/linter/linter.js#L853
  get lineNumber(): number {
    return this.location.start.line;
  }

  // https://github.com/eslint/eslint/blob/b09a512107249a4eb19ef5a37b0bd672266eafdb/lib/linter/linter.js#L854
  get column(): number {
    return this.location.start.column;
  }
}

export function createError(
  message: string,
  ast: ts.SourceFile,
  startIndex: number,
  endIndex: number = startIndex,
): TSError {
  const [start, end] = [startIndex, endIndex].map(offset => {
    const { character: column, line } =
      ast.getLineAndCharacterOfPosition(offset);
    return { column, line: line + 1, offset };
  });
  return new TSError(message, ast.fileName, { end, start });
}

export function nodeHasIllegalDecorators(
  node: ts.Node,
): node is { illegalDecorators: ts.Node[] } & ts.Node {
  return !!(
    'illegalDecorators' in node &&
    (node.illegalDecorators as unknown[] | undefined)?.length
  );
}

export function nodeHasTokens(n: ts.Node, ast: ts.SourceFile): boolean {
  // If we have a token or node that has a non-zero width, it must have tokens.
  // Note: getWidth() does not take trivia into account.
  return n.kind === SyntaxKind.EndOfFileToken
    ? !!(n as ts.JSDocContainer).jsDoc
    : n.getWidth(ast) !== 0;
}

/**
 * Like `forEach`, but suitable for use with numbers and strings (which may be falsy).
 */
export function firstDefined<T, U>(
  array: readonly T[] | undefined,
  callback: (element: T, index: number) => U | undefined,
): U | undefined {
  // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
  if (array === undefined) {
    return undefined;
  }

  for (let i = 0; i < array.length; i++) {
    const result = callback(array[i], i);
    // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}

export function identifierIsThisKeyword(id: ts.Identifier): boolean {
  return (
    (isAtLeast50
      ? ts.identifierToKeywordKind(id)
      : // @ts-expect-error -- intentional fallback for older TS versions <=4.9
        id.originalKeywordKind) === SyntaxKind.ThisKeyword
  );
}

export function isThisIdentifier(
  node: ts.Node | undefined,
): node is ts.Identifier {
  return (
    !!node &&
    node.kind === SyntaxKind.Identifier &&
    identifierIsThisKeyword(node as ts.Identifier)
  );
}

export function isThisInTypeQuery(node: ts.Node): boolean {
  if (!isThisIdentifier(node)) {
    return false;
  }

  while (ts.isQualifiedName(node.parent) && node.parent.left === node) {
    node = node.parent;
  }

  return node.parent.kind === SyntaxKind.TypeQuery;
}

// `ts.nodeIsMissing`
function nodeIsMissing(node: ts.Node | undefined): boolean {
  if (node == null) {
    return true;
  }
  return (
    node.pos === node.end &&
    node.pos >= 0 &&
    node.kind !== SyntaxKind.EndOfFileToken
  );
}

// `ts.nodeIsPresent`
export function nodeIsPresent(node: ts.Node | undefined): node is ts.Node {
  return !nodeIsMissing(node);
}

// `ts.getContainingFunction`
export function getContainingFunction(
  node: ts.Node,
): ts.SignatureDeclaration | undefined {
  return ts.findAncestor(node.parent, ts.isFunctionLike);
}

// `ts.hasAbstractModifier`
function hasAbstractModifier(node: ts.Node): boolean {
  return hasModifier(SyntaxKind.AbstractKeyword, node);
}

// `ts.getThisParameter`
function getThisParameter(
  signature: ts.SignatureDeclaration,
): ts.ParameterDeclaration | null {
  if (signature.parameters.length && !ts.isJSDocSignature(signature)) {
    const thisParameter = signature.parameters[0];
    if (parameterIsThisKeyword(thisParameter)) {
      return thisParameter;
    }
  }

  return null;
}

// `ts.parameterIsThisKeyword`
function parameterIsThisKeyword(parameter: ts.ParameterDeclaration): boolean {
  return isThisIdentifier(parameter.name);
}

// Rewrite version of `ts.nodeCanBeDecorated`
// Returns `true` for both `useLegacyDecorators: true` and `useLegacyDecorators: false`
export function nodeCanBeDecorated(node: TSNode): boolean {
  switch (node.kind) {
    case SyntaxKind.ClassDeclaration:
      return true;
    case SyntaxKind.ClassExpression:
      // `ts.nodeCanBeDecorated` returns `false` if `useLegacyDecorators: true`
      return true;
    case SyntaxKind.PropertyDeclaration: {
      const { parent } = node;

      // `ts.nodeCanBeDecorated` uses this if `useLegacyDecorators: true`
      if (ts.isClassDeclaration(parent)) {
        return true;
      }

      // `ts.nodeCanBeDecorated` uses this if `useLegacyDecorators: false`
      if (ts.isClassLike(parent) && !hasAbstractModifier(node)) {
        return true;
      }

      return false;
    }
    case SyntaxKind.GetAccessor:
    case SyntaxKind.SetAccessor:
    case SyntaxKind.MethodDeclaration: {
      const { parent } = node;
      // In `ts.nodeCanBeDecorated`
      // when `useLegacyDecorators: true` uses `ts.isClassDeclaration`
      // when `useLegacyDecorators: true` uses `ts.isClassLike`
      return (
        Boolean(node.body) &&
        (ts.isClassDeclaration(parent) || ts.isClassLike(parent))
      );
    }
    case SyntaxKind.Parameter: {
      // `ts.nodeCanBeDecorated` returns `false` if `useLegacyDecorators: false`

      const { parent } = node;
      const grandparent = parent.parent;

      return (
        Boolean(parent) &&
        'body' in parent &&
        Boolean(parent.body) &&
        (parent.kind === SyntaxKind.Constructor ||
          parent.kind === SyntaxKind.MethodDeclaration ||
          parent.kind === SyntaxKind.SetAccessor) &&
        getThisParameter(parent) !== node &&
        Boolean(grandparent) &&
        grandparent.kind === SyntaxKind.ClassDeclaration
      );
    }
  }

  return false;
}

export function isValidAssignmentTarget(node: ts.Node): boolean {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return true;
    case SyntaxKind.PropertyAccessExpression:
    case SyntaxKind.ElementAccessExpression:
      if (node.flags & ts.NodeFlags.OptionalChain) {
        return false;
      }
      return true;
    case SyntaxKind.ParenthesizedExpression:
    case SyntaxKind.TypeAssertionExpression:
    case SyntaxKind.AsExpression:
    case SyntaxKind.SatisfiesExpression:
    case SyntaxKind.ExpressionWithTypeArguments:
    case SyntaxKind.NonNullExpression:
      return isValidAssignmentTarget(
        (
          node as
            | ts.AssertionExpression
            | ts.ExpressionWithTypeArguments
            | ts.NonNullExpression
            | ts.ParenthesizedExpression
            | ts.SatisfiesExpression
        ).expression,
      );
    default:
      return false;
  }
}

export function getNamespaceModifiers(
  node: ts.ModuleDeclaration,
): ts.Modifier[] | undefined {
  // For following nested namespaces, use modifiers given to the topmost namespace
  //   export declare namespace foo.bar.baz {}
  let modifiers = getModifiers(node);
  let moduleDeclaration = node;
  while (
    (!modifiers || modifiers.length === 0) &&
    ts.isModuleDeclaration(moduleDeclaration.parent)
  ) {
    const parentModifiers = getModifiers(moduleDeclaration.parent);
    if (parentModifiers?.length) {
      modifiers = parentModifiers;
    }
    moduleDeclaration = moduleDeclaration.parent;
  }
  return modifiers;
}
