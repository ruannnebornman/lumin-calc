import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
// --- Type Definitions ---
type Operator = '+' | '-' | '*' | '/';
type Token = string | number;
interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: Date;
}
// --- Core Calculation Logic ---
const OPERATORS: { [key: string]: { precedence: number, associativity: 'Left' | 'Right' } } = {
  '+': { precedence: 2, associativity: 'Left' },
  '-': { precedence: 2, associativity: 'Left' },
  '*': { precedence: 3, associativity: 'Left' },
  '/': { precedence: 3, associativity: 'Left' },
};
// Tokenizes the expression string
const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];
  let currentNumber = '';
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (/\d|\./.test(char)) {
      currentNumber += char;
    } else {
      if (currentNumber) {
        tokens.push(parseFloat(currentNumber));
        currentNumber = '';
      }
      if (/[+\-*/()]/.test(char)) {
        // Handle unary minus
        const prevToken = tokens[tokens.length - 1];
        if (char === '-' && (tokens.length === 0 || prevToken === '(' || typeof prevToken === 'string' && /[+\-*/]/.test(prevToken))) {
          tokens.push('neg');
        } else {
          tokens.push(char);
        }
      }
    }
  }
  if (currentNumber) {
    tokens.push(parseFloat(currentNumber));
  }
  return tokens;
};
// Shunting-yard algorithm to convert infix to RPN
const toRPN = (tokens: Token[]): Token[] => {
  const outputQueue: Token[] = [];
  const operatorStack: string[] = [];
  for (const token of tokens) {
    if (typeof token === 'number') {
      outputQueue.push(token);
    } else if (token in OPERATORS) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        (OPERATORS[operatorStack[operatorStack.length - 1]].precedence > OPERATORS[token].precedence ||
          (OPERATORS[operatorStack[operatorStack.length - 1]].precedence === OPERATORS[token].precedence && OPERATORS[token].associativity === 'Left'))
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === 'neg') {
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop();
      } else {
        throw new Error('Mismatched parentheses');
      }
    }
  }
  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op === '(') throw new Error('Mismatched parentheses');
    outputQueue.push(op);
  }
  return outputQueue;
};
// Evaluates an RPN queue
const evaluateRPN = (rpnQueue: Token[]): number => {
  const stack: number[] = [];
  for (const token of rpnQueue) {
    if (typeof token === 'number') {
      stack.push(token);
    } else if (token === 'neg') {
      if (stack.length < 1) throw new Error('Invalid expression');
      stack.push(-stack.pop()!);
    } else {
      if (stack.length < 2) throw new Error('Invalid expression');
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          stack.push(a / b);
          break;
      }
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
};
// Formats a number to a max of 12 significant digits and removes trailing zeros
const formatNumber = (num: number): string => {
  if (Number.isNaN(num) || !Number.isFinite(num)) return "Error";
  const str = num.toPrecision(12);
  if (str.includes('.')) {
    return parseFloat(str).toString();
  }
  return str;
};
// --- KeyButton Component ---
interface KeyButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  value: string;
  className?: string;
  isPrimary?: boolean;
}
const KeyButton = React.forwardRef<HTMLButtonElement, KeyButtonProps>(
  ({ value, className, isPrimary = false, ...props }, ref) => (
    <motion.div whileTap={{ scale: 0.95 }} className="h-full w-full">
      <Button
        ref={ref}
        variant="secondary"
        className={cn(
          "h-14 w-full rounded-xl text-xl font-medium shadow-sm transition-all duration-150 hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 active:scale-95",
          isPrimary ? "btn-gradient text-primary-foreground text-2xl" : "bg-card hover:bg-muted/80",
          className
        )}
        {...props}
      >
        {value}
      </Button>
    </motion.div>
  )
);
KeyButton.displayName = "KeyButton";
// --- Main Calculator Component ---
export function Calculator() {
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [memory, setMemory] = useState(0);
  const [isResult, setIsResult] = useState(false);
  const handleInput = useCallback((value: string) => {
    if (isResult) {
      setExpression(value);
      setDisplayValue(value);
      setIsResult(false);
      return;
    }
    setExpression(prev => prev + value);
    setDisplayValue(prev => (prev === '0' && value !== '.') ? value : prev + value);
  }, [isResult]);
  const handleOperator = useCallback((op: Operator) => {
    if (isResult) {
      setExpression(displayValue + op);
      setIsResult(false);
    } else {
      setExpression(prev => prev + op);
    }
    setDisplayValue('0');
  }, [isResult, displayValue]);
  const handleDecimal = useCallback(() => {
    if (!displayValue.includes('.')) {
      handleInput('.');
    }
  }, [displayValue, handleInput]);
  const clear = useCallback(() => {
    setExpression('');
    setDisplayValue('0');
    setIsResult(false);
  }, []);
  const backspace = useCallback(() => {
    if (isResult) {
      clear();
      return;
    }
    setExpression(prev => prev.slice(0, -1));
    setDisplayValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, [isResult, clear]);
  const evaluate = useCallback(() => {
    if (!expression) return;
    try {
      const tokens = tokenize(expression);
      const rpn = toRPN(tokens);
      const result = evaluateRPN(rpn);
      const formattedResult = formatNumber(result);
      setDisplayValue(formattedResult);
      setHistory(prev => [{ expression, result: formattedResult, timestamp: new Date() }, ...prev]);
      setExpression(formattedResult);
      setIsResult(true);
      toast.success('Result saved to history');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid calculation';
      setDisplayValue('Error');
      setExpression('');
      setIsResult(true);
      toast.error(message);
    }
  }, [expression]);
  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (/\d/.test(key)) handleInput(key);
      else if (/[+\-*/]/.test(key)) handleOperator(key as Operator);
      else if (key === '.') handleDecimal();
      else if (key === 'Enter' || key === '=') { event.preventDefault(); evaluate(); }
      else if (key === 'Backspace') backspace();
      else if (key.toLowerCase() === 'c') clear();
      else if (key === '(') handleInput('(');
      else if (key === ')') handleInput(')');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [evaluate, handleInput, handleOperator, handleDecimal, backspace, clear]);
  const memoryClear = () => { setMemory(0); toast.info("Memory cleared"); };
  const memoryRecall = () => { handleInput(String(memory)); };
  const memoryAdd = () => { const val = parseFloat(displayValue); if (!isNaN(val)) { setMemory(m => m + val); toast.success("Added to memory"); } };
  const memorySubtract = () => { const val = parseFloat(displayValue); if (!isNaN(val)) { setMemory(m => m - val); toast.success("Subtracted from memory"); } };
  return (
    <Card className="w-full max-w-md mx-auto shadow-soft rounded-2xl border-border/60 glass-dark overflow-hidden animate-scale-in">
      <CardContent className="p-4 sm:p-6">
        {/* Display */}
        <div className="text-right mb-4 px-2 min-h-[80px] flex flex-col justify-end">
          <div className="text-muted-foreground text-sm truncate" title={expression || 'Enter an expression'}>
            {expression || '0'}
          </div>
          <motion.div key={displayValue} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-4xl sm:text-5xl font-semibold tabular-nums break-all leading-tight">
              {displayValue}
            </div>
          </motion.div>
        </div>
        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Row 1 */}
          <KeyButton value="AC" onClick={clear} className="bg-muted/50 hover:bg-muted/80" />
          <KeyButton value="(" onClick={() => handleInput('(')} className="bg-muted/50 hover:bg-muted/80" />
          <KeyButton value=")" onClick={() => handleInput(')')} className="bg-muted/50 hover:bg-muted/80" />
          <KeyButton value="/" onClick={() => handleOperator('/')} className="text-orange-500 text-2xl" />
          {/* Row 2 */}
          <KeyButton value="7" onClick={() => handleInput('7')} />
          <KeyButton value="8" onClick={() => handleInput('8')} />
          <KeyButton value="9" onClick={() => handleInput('9')} />
          <KeyButton value="*" onClick={() => handleOperator('*')} className="text-orange-500 text-2xl" />
          {/* Row 3 */}
          <KeyButton value="4" onClick={() => handleInput('4')} />
          <KeyButton value="5" onClick={() => handleInput('5')} />
          <KeyButton value="6" onClick={() => handleInput('6')} />
          <KeyButton value="-" onClick={() => handleOperator('-')} className="text-orange-500 text-2xl" />
          {/* Row 4 */}
          <KeyButton value="1" onClick={() => handleInput('1')} />
          <KeyButton value="2" onClick={() => handleInput('2')} />
          <KeyButton value="3" onClick={() => handleInput('3')} />
          <KeyButton value="+" onClick={() => handleOperator('+')} className="text-orange-500 text-2xl" />
          {/* Row 5 */}
          <KeyButton value="0" onClick={() => handleInput('0')} className="col-span-2" />
          <KeyButton value="." onClick={handleDecimal} />
          <KeyButton value="=" onClick={evaluate} isPrimary />
        </div>
        {/* Memory and History Controls */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-3">
            <KeyButton value="M+" onClick={memoryAdd} className="text-xs sm:text-sm"/>
            <KeyButton value="M-" onClick={memorySubtract} className="text-xs sm:text-sm"/>
            <KeyButton value="MR" onClick={memoryRecall} className="text-xs sm:text-sm"/>
            <KeyButton value="MC" onClick={memoryClear} className="text-xs sm:text-sm"/>
            <Sheet>
              <SheetTrigger asChild>
                <KeyButton value="" className="text-xs sm:text-sm"><History className="h-5 w-5"/></KeyButton>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Calculation History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-80px)]">
                  {history.length > 0 ? (
                    <div className="space-y-4 py-4">
                      {history.map((item, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm cursor-pointer hover:bg-muted" onClick={() => { setExpression(item.expression); setDisplayValue('0'); setIsResult(false); }}>
                          <p className="text-muted-foreground truncate">{item.expression} =</p>
                          <p className="font-semibold text-lg">{item.result}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{format(item.timestamp, 'PPp')}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <History className="h-12 w-12 mb-4" />
                      <p className="font-semibold">No history yet</p>
                      <p className="text-sm">Your calculations will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
                <SheetFooter>
                    <Button variant="outline" onClick={() => {setHistory([]); toast.info("History cleared")}}>Clear History</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
        </div>
      </CardContent>
    </Card>
  );
}