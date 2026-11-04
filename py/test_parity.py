import json
import os
import unittest

from usr import (
    PipeError,
    cut,
    grep,
    head,
    parse_flag_string,
    pipeable,
    sort,
    tail,
    uniq,
    wc,
)


class TestParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        path = os.path.join(os.path.dirname(__file__), "..", "test-parity", "scenarios.json")
        with open(path, "r", encoding="utf-8") as f:
            cls.scenarios = json.load(f)

    def test_flag_strings_parity(self):
        for tc in self.scenarios["flag_strings"]:
            parsed = parse_flag_string(tc["input"])
            self.assertEqual(parsed.get("url"), tc["expected_url"])
            if "expected_headers" in tc:
                self.assertEqual(parsed.get("headers"), tc["expected_headers"])
            if "expected_timeout" in tc:
                self.assertEqual(parsed.get("timeout"), tc["expected_timeout"])
            if "expected_params" in tc:
                self.assertEqual(parsed.get("params"), tc["expected_params"])

    def test_pipes_parity(self):
        for p in self.scenarios["pipe_tests"]:
            stage = p["stage"]
            arg = p.get("arg")
            initial = pipeable(p["input"])

            if stage == "grep":
                res = initial | grep(arg)
            elif stage == "head":
                res = initial | head(arg)
            elif stage == "tail":
                res = initial | tail(arg)
            elif stage == "sort":
                res = initial | sort(arg)
            elif stage == "uniq":
                res = initial | uniq(arg)
            elif stage == "cut":
                res = initial | cut(*arg)
            elif stage == "wc":
                res = initial | wc()
            else:
                self.fail(f"Unknown stage: {stage}")

            self.assertEqual(res.data, p["expected"], f"Failed on pipe stage {p['name']}")

    def test_pipe_error_on_non_array(self):
        with self.assertRaises(PipeError) as ctx:
            _ = pipeable("not-an-array") | wc()
        self.assertEqual(ctx.exception.code, "ERR_BAD_PIPE")


if __name__ == "__main__":
    unittest.main()
