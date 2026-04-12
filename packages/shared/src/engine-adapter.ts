export interface EngineAdapter<
  TState = Record<string, any>,
  TMethods = Record<string, any>,
  TReturnProps = Record<string, any>
> {
  name: string;
  state: TState;
  methods: TMethods;
  getProps: (elementName: string, props?: Record<string, any>) => TReturnProps;
}
