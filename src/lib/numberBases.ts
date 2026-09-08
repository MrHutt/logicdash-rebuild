// Shared decimal/hex conversion + validation helpers for the Binary ↔ Hex ↔
// Decimal page's live converter and practice quiz, so both tools convert
// exactly the same way. Binary conversion reuses decimalToBinary.ts's
// decimalToBinary8 rather than redefining it.
import { decimalToBinary8 } from "./decimalToBinary";

export { decimalToBinary8 };

export function clampByte(n: number): number {
	return Math.max(0, Math.min(255, Math.floor(n)));
}

export function decimalToHex2(n: number): string {
	return clampByte(n).toString(16).toUpperCase().padStart(2, "0");
}

export function isValidBinaryInput(value: string): boolean {
	return /^[01]*$/.test(value);
}

export function isValidHexInput(value: string): boolean {
	return /^[0-9a-fA-F]*$/.test(value);
}

export function isValidDecimalInput(value: string): boolean {
	return /^[0-9]*$/.test(value);
}
