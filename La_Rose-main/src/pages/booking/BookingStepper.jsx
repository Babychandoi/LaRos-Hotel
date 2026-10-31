import { Check } from "lucide-react";
import { STEPS } from "./bookingHelpers";

const BookingStepper = ({ step }) => (
    <nav aria-label="Các bước đặt phòng">
        <ol className="flex items-center">
            {STEPS.map((title, index) => {
                const number = index + 1;
                const isDone = step > number;
                const isActive = step === number;
                return (
                    <li
                        key={title}
                        className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}
                        aria-current={isActive ? "step" : undefined}
                    >
                        <div className="flex items-center gap-2.5">
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                                    isDone || isActive
                                        ? "border-rose-600 bg-rose-600 text-white"
                                        : "border-slate-300 bg-white text-slate-400"
                                }`}
                            >
                                {isDone ? <Check className="h-4 w-4" /> : number}
                            </span>
                            <span
                                className={`hidden whitespace-nowrap text-sm font-medium sm:inline ${
                                    isDone || isActive ? "text-slate-900" : "text-slate-400"
                                }`}
                            >
                                {title}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <span
                                className={`mx-3 h-0.5 flex-1 rounded-full sm:mx-4 ${
                                    isDone ? "bg-rose-600" : "bg-slate-200"
                                }`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
        <p className="mt-3 text-center text-sm font-medium text-slate-700 sm:hidden">
            Bước {step}/{STEPS.length}: {STEPS[step - 1]}
        </p>
    </nav>
);

export default BookingStepper;
