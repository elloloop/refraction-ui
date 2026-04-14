export interface Trigger {
  char: string;
  pattern?: RegExp;
}

export interface CommandNode {
  type: 'command';
  trigger: string;
  text: string;
}

export interface TextNode {
  type: 'text';
  text: string;
}

export type InputNode = TextNode | CommandNode;

export interface CommandInputState {
  nodes: InputNode[];
  rawText: string;
  cursorPosition: number;
  activeTrigger: Trigger | null;
  activeCommandText: string | null;
}

export interface CommandInputOptions {
  triggers: Trigger[];
  onCommandTriggered?: (trigger: Trigger, text: string) => void;
  onStateChange?: (state: CommandInputState) => void;
  onCommandCommit?: (trigger: Trigger, text: string) => void;
  onCommandCancel?: () => void;
}

export class CommandInput {
  private state: CommandInputState = {
    nodes: [],
    rawText: '',
    cursorPosition: 0,
    activeTrigger: null,
    activeCommandText: null,
  };

  private options: CommandInputOptions;

  constructor(options: CommandInputOptions) {
    this.options = { ...options };
  }

  public handleInput(text: string, cursorPosition: number): void {
    this.state.rawText = text;
    this.state.cursorPosition = cursorPosition;
    this.parseInput();
    this.notifyStateChange();
  }

  public handleKeyDown(key: string, event?: Event): void {
    if (this.state.activeTrigger) {
      if (key === 'Escape') {
        if (event) event.preventDefault();
        this.state.activeTrigger = null;
        this.state.activeCommandText = null;
        if (this.options.onCommandCancel) {
          this.options.onCommandCancel();
        }
        this.notifyStateChange();
      } else if (key === 'Enter') {
        if (event) event.preventDefault();
        const trigger = this.state.activeTrigger;
        const text = this.state.activeCommandText || '';
        this.state.activeTrigger = null;
        this.state.activeCommandText = null;
        if (this.options.onCommandCommit) {
          this.options.onCommandCommit(trigger, text);
        }
        this.notifyStateChange();
      }
    }
  }

  public get value(): InputNode[] {
    return this.state.nodes;
  }

  public getState(): CommandInputState {
    return { ...this.state };
  }

  private parseInput() {
    const { rawText, cursorPosition } = this.state;

    this.state.activeTrigger = null;
    this.state.activeCommandText = null;

    for (let i = cursorPosition - 1; i >= 0; i--) {
      const char = rawText[i];
      const matchedTrigger = this.options.triggers.find((t) => t.char === char);

      if (matchedTrigger) {
        const isStartOfWord = i === 0 || /\\s/.test(rawText[i - 1]);
        if (isStartOfWord) {
          const commandText = rawText.slice(i + 1, cursorPosition);
          if (!/\\s/.test(commandText)) {
            let isValid = true;
            if (matchedTrigger.pattern) {
              isValid = matchedTrigger.pattern.test(commandText);
            }
            if (isValid) {
              this.state.activeTrigger = matchedTrigger;
              this.state.activeCommandText = commandText;
              
              if (this.options.onCommandTriggered) {
                this.options.onCommandTriggered(matchedTrigger, commandText);
              }
            }
          }
        }
        break;
      }
      
      if (/\\s/.test(char)) {
        break;
      }
    }

    const nodes: InputNode[] = [];
    if (this.options.triggers.length === 0) {
      nodes.push({ type: 'text', text: rawText });
      this.state.nodes = nodes;
      return;
    }

    const triggerChars = this.options.triggers.map((t) => t.char.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
    const patternStr = `(^|\\\\s)(${triggerChars.join('|')})([^\\\\s]*)`;
    const regex = new RegExp(patternStr, 'g');
    
    let currentIndex = 0;
    let match;

    while ((match = regex.exec(rawText)) !== null) {
      const precedingWhitespace = match[1];
      const triggerChar = match[2];
      const commandText = match[3];

      const matchStart = match.index;
      const triggerStart = matchStart + precedingWhitespace.length;

      const triggerConfig = this.options.triggers.find(t => t.char === triggerChar);
      let isValid = true;
      if (triggerConfig?.pattern && commandText.length > 0) {
        isValid = triggerConfig.pattern.test(commandText);
      }

      if (isValid) {
        if (triggerStart > currentIndex) {
          nodes.push({ type: 'text', text: rawText.slice(currentIndex, triggerStart) });
        }

        nodes.push({ type: 'command', trigger: triggerChar, text: commandText });
        currentIndex = regex.lastIndex;
      }
    }

    if (currentIndex < rawText.length) {
      nodes.push({ type: 'text', text: rawText.slice(currentIndex) });
    }

    this.state.nodes = nodes;
  }

  private notifyStateChange() {
    if (this.options.onStateChange) {
      this.options.onStateChange({ ...this.state });
    }
  }
}