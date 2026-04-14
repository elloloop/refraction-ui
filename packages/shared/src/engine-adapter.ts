export interface EngineAdapter<
  TState = Record<string, unknown>,
  TMethods = Record<string, unknown>,
  TReturnProps = Record<string, unknown>
> {
  name: string;
  state: TState;
  methods: TMethods;
  getProps: (elementName: string, props?: Record<string, unknown>) => TReturnProps;
}
