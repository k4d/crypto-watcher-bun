import { beforeEach, expect, test, vi } from "bun:test";
import cron from "node-cron";
import { InvalidIntervalError, SchedulerStart } from "@/components";
import config from "@/config";
import { startScheduler } from "./index";

// Mock the modules we depend on
vi.mock("node-cron", () => ({
	default: {
		schedule: vi.fn(),
	},
}));

vi.mock("@/config", () => ({
	// This allows us to change the config for each test
	default: {
		fetch_interval: "5m", // Default mock value
	},
}));

vi.mock("@/components", () => ({
	SchedulerStart: vi.fn(),
	InvalidIntervalError: vi.fn(),
}));

// A helper function to set the mock config value
const mockConfig = (interval: string) => {
	config.fetch_interval = interval;
};

// Reset mocks before each test to ensure a clean state
beforeEach(() => {
	vi.clearAllMocks();
});

test("startScheduler should schedule a task for minutes", () => {
	mockConfig("10m");
	const task = () => {};
	startScheduler(task);

	expect(cron.schedule).toHaveBeenCalledWith("0 */10 * * * *", task);
	expect(SchedulerStart).toHaveBeenCalledWith("10m");
	expect(InvalidIntervalError).not.toHaveBeenCalled();
});

test("startScheduler should schedule a task for seconds", () => {
	mockConfig("30s");
	const task = () => {};
	startScheduler(task);

	expect(cron.schedule).toHaveBeenCalledWith("*/30 * * * * *", task);
	expect(SchedulerStart).toHaveBeenCalledWith("30s");
	expect(InvalidIntervalError).not.toHaveBeenCalled();
});

test("startScheduler should schedule a task for hours", () => {
	mockConfig("2h");
	const task = () => {};
	startScheduler(task);

	expect(cron.schedule).toHaveBeenCalledWith("0 0 */2 * * *", task);
	expect(SchedulerStart).toHaveBeenCalledWith("2h");
	expect(InvalidIntervalError).not.toHaveBeenCalled();
});

test("startScheduler should call error log for invalid interval", () => {
	// Mock process.exit to prevent the test runner from exiting
	const exitMock = vi
		.spyOn(process, "exit")
		.mockImplementation((_code?: number): never => {
			// Do nothing, just return, so the test runner doesn't exit prematurely.
			// The spy will still record that it was called.
			return undefined as never;
		});

	mockConfig("10years");
	const task = () => {};
	startScheduler(task);

	expect(InvalidIntervalError).toHaveBeenCalledWith("10years");
	expect(cron.schedule).not.toHaveBeenCalled();
	expect(SchedulerStart).not.toHaveBeenCalled();
	expect(exitMock).toHaveBeenCalledWith(1);

	// Restore the original process.exit
	exitMock.mockRestore();
});
