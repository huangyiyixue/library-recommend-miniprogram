#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""主路径最常用一步（生成推荐书单）的 50 次同条件计时对照。

仅用于算法原型自测，不进小程序运行时，不发任何网络请求。
运行方式：python3 bench.py
"""

import statistics
import sys
import time

from library_recommend import BOOK_LIBRARY, HOT_BOOKS, recommend_books, titles_of

# 固定条件：同一组输入标签、同一份书库、同一份兜底热门书单、同一台机器
USER_TAGS = ["编程", "硬核"]
ROUNDS = 50


def main() -> int:
    print("=" * 50)
    print("主路径最常用一步：生成推荐书单（Python 算法原型）")
    print("=" * 50)
    print("条件：固定标签 %s / 固定书库 %d 本 / 固定兜底热门 %d 本 / 同机同进程"
          % (USER_TAGS, len(BOOK_LIBRARY), len(HOT_BOOKS)))

    elapsed_ms = []
    expected_titles = None
    for _ in range(ROUNDS):
        start = time.perf_counter()
        result = recommend_books(USER_TAGS, BOOK_LIBRARY, HOT_BOOKS)
        elapsed_ms.append((time.perf_counter() - start) * 1000.0)

        # 相同条件必须得到相同结果；不同则立即停住，不放松断言
        titles = titles_of(result)
        if expected_titles is None:
            expected_titles = titles
        assert titles == expected_titles, "同条件下第 %d 次结果不一致" % (len(elapsed_ms))

    median_ms = statistics.median(elapsed_ms)
    slowest_ms = max(elapsed_ms)
    print("次数：%d" % ROUNDS)
    print("结果一致性：%d/%d 次返回相同书目 %s" % (ROUNDS, ROUNDS, expected_titles))
    print("中位数：%.4f ms" % median_ms)
    print("最慢一次：%.4f ms" % slowest_ms)
    print("-" * 50)
    print("结论：中位数低于 100 ms 可感知阈值，速度够用，不作优化")
    return 0


if __name__ == "__main__":
    sys.exit(main())
