/* src/features/exam-paper/hooks/usePrint.ts */
export function usePrint() {
  const handlePrint = () => {
    window.print();
  };
  return { handlePrint };
}
