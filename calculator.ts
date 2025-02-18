
interface CalculatorState {
    currentValue: string;
    previousValue: string;
    operation: string | null;
    overwrite: boolean;
  }

  const initialState: CalculatorState = {
    currentValue: "0",
    previousValue: "",
    operation: null,
    overwrite: false
  };

  function updateState(
    state: CalculatorState,
    partial: Partial<CalculatorState>
  ): CalculatorState {
    return { ...state, ...partial };
  }

  function add(a: number, b: number): number {
    return a + b;
  }
  
  function subtract(a: number, b: number): number {
    return a - b;
  }
  
  function multiply(a: number, b: number): number {
    return a * b;
  }
  
  function divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Деление на ноль");
    }
    return a / b;
  }
  
  function power(a: number, b: number): number {
    return Math.pow(a, b);
  }
  
  function sqrt(a: number): number {
    if (a < 0) {
      throw new Error("Нельзя брать корень из отрицательного числа");
    }
    return Math.sqrt(a);
  }

  type BinaryOperation = (x: number, y: number) => number;
  function createBinaryOperation(op: BinaryOperation) {
    return (a: number, b: number) => op(a, b);
  }

  function calculateResult(
    state: CalculatorState,
    operation: string,
    prevValue: string,
    currValue: string
  ): string {
    const a = parseFloat(prevValue);
    const b = parseFloat(currValue);
  
    let result: number;
  
    switch (operation) {
      case "+":
        result = createBinaryOperation(add)(a, b);
        break;
      case "-":
        result = createBinaryOperation(subtract)(a, b);
        break;
      case "*":
        result = createBinaryOperation(multiply)(a, b);
        break;
      case "/":
        result = createBinaryOperation(divide)(a, b);
        break;
      case "^":
        result = createBinaryOperation(power)(a, b);
        break;
      default:
        return currValue;
    }
    return result.toString();
  }

  function handleNumberInput(
    state: CalculatorState,
    digit: string
  ): CalculatorState {
    if (state.overwrite || state.currentValue === "0") {
      return updateState(state, {
        currentValue: digit,
        overwrite: false
      });
    }

    return updateState(state, {
      currentValue: state.currentValue + digit
    });
  }

  function handleDecimalPoint(state: CalculatorState): CalculatorState {
    if (state.currentValue.includes(".")) {
      return state;
    }
    if (state.overwrite) {
      return updateState(state, {
        currentValue: "0.",
        overwrite: false
      });
    }
    return updateState(state, {
      currentValue: state.currentValue + ".",
    });
  }

  function handleOperationInput(
    state: CalculatorState,
    operation: string
  ): CalculatorState {
    if (state.operation && state.previousValue) {
      const computed = calculateResult(
        state,
        state.operation,
        state.previousValue,
        state.currentValue
      );
  
      return updateState(state, {
        currentValue: computed,
        previousValue: computed,
        operation,
        overwrite: true
      });
    } else {
      return updateState(state, {
        previousValue: state.currentValue,
        operation,
        overwrite: true
      });
    }
  }

  function handleEquals(state: CalculatorState): CalculatorState {
    if (!state.operation || !state.previousValue) {
      return state;
    }
  
    const result = calculateResult(
      state,
      state.operation,
      state.previousValue,
      state.currentValue
    );
  
    return updateState(state, {
      currentValue: result,
      previousValue: "",
      operation: null,
      overwrite: true
    });
  }

  function handleSqrt(state: CalculatorState): CalculatorState {
    try {
      const value = parseFloat(state.currentValue);
      const result = sqrt(value);
      return updateState(state, {
        currentValue: result.toString(),
        previousValue: "",
        operation: null,
        overwrite: true
      });
    } catch (error) {
      alert(error);
      return initialState;
    }
  }

  function handleClear(): CalculatorState {
    return { ...initialState };
  }

  let calculatorState = { ...initialState };
  const displayElement = document.getElementById("display") as HTMLInputElement;
  const buttons = document.querySelectorAll("button");
  
  function render(state: CalculatorState) {
    displayElement.value = state.currentValue;
  }
  
  function updateAndRender(newState: CalculatorState) {
    calculatorState = newState;
    render(calculatorState);
  }

  render(calculatorState);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const number = button.getAttribute("data-number");
      const operation = button.getAttribute("data-operation");
  
      if (number !== null) {
        const newState = handleNumberInput(calculatorState, number);
        updateAndRender(newState);
      } else if (operation !== null) {
        switch (operation) {
          case "+":
          case "-":
          case "*":
          case "/":
          case "^":
            updateAndRender(handleOperationInput(calculatorState, operation));
            break;
          case ".":
            updateAndRender(handleDecimalPoint(calculatorState));
            break;
          case "=":
            updateAndRender(handleEquals(calculatorState));
            break;
          case "sqrt":
            updateAndRender(handleSqrt(calculatorState));
            break;
          case "clear":
            updateAndRender(handleClear());
            break;
          default:
            break;
        }
      }
    });
  });
  