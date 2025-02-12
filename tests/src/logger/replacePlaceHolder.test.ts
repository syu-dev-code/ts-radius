import { replacePlaceHolder } from '@app/logger/replacePlaceHolder';

describe('@app/logger/replacePlaceHolder', () => {
  it('case1 - basic placeholder replacement', () => {
    const template = 'This is ${a} ${pen}.';
    const params = { a: 'a', pen: 'pen' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('This is a pen.');
  });

  it('case2 - multiple occurrences of same placeholder', () => {
    const template = 'This is ${a} ${a}.';
    const params = { a: 'a' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('This is a a.');
  });

  it('case3 - placeholder value contains another placeholder pattern', () => {
    const template = 'This is ${a}.';
    const params = { a: '${pen}', pen: 'pen' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('This is ${pen}.');
  });

  it('case4 - nested placeholder pattern', () => {
    const template = 'This is ${${a}}.';
    const params = { a: 'test' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('This is ${test}.');
  });

  it('case5 - undefined placeholder remains', () => {
    const template = 'Hello, ${name}!';
    const params = {};
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Hello, ${name}!');
  });

  it('case6 - partial replacement', () => {
    const template = '${greeting}, ${name}!';
    const params = { greeting: 'Hi' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Hi, ${name}!');
  });

  it('case7 - multiple adjacent placeholders', () => {
    const template = '${x}${y}${z}';
    const params = { x: 'A', y: 'B', z: 'C' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('ABC');
  });

  it('case8 - no placeholders in template', () => {
    const template = 'No placeholders here.';
    const params = { anything: 'test' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('No placeholders here.');
  });

  it('case9 - no recursive replacement', () => {
    const template = 'Nested ${a}.';
    const params = { a: '${b}', b: '${c}', c: 'final' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Nested ${b}.');
  });

  it('case10 - escaped placeholder remains unchanged', () => {
    const template = 'Escaped \\${a}.';
    const params = { a: 'value' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Escaped ${a}.');
  });

  it('case11 - multiple escaped placeholders', () => {
    const template = 'Multiple \\${a} and \\${b}.';
    const params = { a: 'value1', b: 'value2' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Multiple ${a} and ${b}.');
  });

  it('case12 - mixed escaped and non-escaped placeholders', () => {
    const template = 'Mixed ${a} and \\${a}.';
    const params = { a: 'value' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Mixed value and ${a}.');
  });

  it('case13 - backslash escape sequence handling', () => {
    const template = '\\$ \\${ \\${a \\\\${a} \\${} \\\\${}';
    const params = { a: 'value' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('\\$ \\${ \\${a \\${a} \\${} \\\\${}');
  });

  it('case13-1 - single backslash before non-placeholder', () => {
    const template = '\\$ \\${';
    const params = {};
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('\\$ \\${');
  });

  it('case13-2 - single backslash before placeholder', () => {
    const template = '\\${a}';
    const params = { a: 'value' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('${a}');
  });

  it('case13-3 - double backslash before placeholder', () => {
    const template = '\\\\${a}';
    const params = { a: 'value' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('\\${a}');
  });

  it('case13-4 - empty placeholder with backslash', () => {
    const template = '\\${} \\\\${}';
    const params = {};
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('\\${} \\\\${}');
  });

  it('case14 - empty placeholder key', () => {
    const template = 'Empty ${}.';
    const params = { '': 'value' };
    const actual = replacePlaceHolder(template, params);
    expect(actual).toBe('Empty ${}.');
  });
});
