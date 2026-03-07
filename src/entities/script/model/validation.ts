import type { Script } from "@/entities/script/model/script";

export interface DomainValidationError {
  code: string;
  message: string;
  path: string;
}

export interface DomainValidationResult {
  valid: boolean;
  errors: DomainValidationError[];
}

export interface ScriptValidator {
  validate(script: Script): DomainValidationResult;
}

export const noopScriptValidator: ScriptValidator = {
  validate() {
    return { valid: true, errors: [] };
  },
};
