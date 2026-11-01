#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""图书馆书籍推荐算法 + 极简 harness 测试支架（仅用标准库，可直接运行）。

运行方式：python3 library_recommend.py
"""

import sys
from typing import Callable, Dict, List, Optional, Sequence

# ---------------------------------------------------------------- 数据定义

# 内置书籍库：每本书包含书名 title 与标签列表 tags
BOOK_LIBRARY: List[Dict] = [
    {"title": "三体", "tags": ["科幻", "小说", "硬核"]},
    {"title": "球状闪电", "tags": ["科幻", "小说"]},
    {"title": "时间简史", "tags": ["科普", "物理", "宇宙"]},
    {"title": "代码整洁之道", "tags": ["编程", "软件工程", "计算机"]},
    {"title": "算法导论", "tags": ["编程", "算法", "计算机", "硬核"]},
    {"title": "人类简史", "tags": ["历史", "科普", "社会学"]},
    {"title": "活着", "tags": ["小说", "文学", "当代"]},
    {"title": "百年孤独", "tags": ["小说", "文学", "魔幻现实主义"]},
]

# 兜底热门书单：无借阅记录或无匹配结果时返回
HOT_BOOKS: List[Dict] = [
    {"title": "三体", "tags": ["科幻", "小说", "硬核"]},
    {"title": "活着", "tags": ["小说", "文学", "当代"]},
    {"title": "人类简史", "tags": ["历史", "科普", "社会学"]},
]


# ---------------------------------------------------------------- 推荐算法

def recommend_books(user_tags: Optional[Sequence[str]],
                    book_library: List[Dict] = None,
                    hot_books: List[Dict] = None) -> List[Dict]:
    """根据用户借阅标签推荐书籍。

    分支逻辑：
      1. 借阅标签为空 -> 直接返回兜底 hot_books；
      2. 有借阅标签且存在标签重合 -> 返回重合的书籍（按书库原顺序、去重）；
      3. 有借阅标签但无任何匹配 -> 同样返回 hot_books。
    """
    library = BOOK_LIBRARY if book_library is None else book_library
    fallback = HOT_BOOKS if hot_books is None else hot_books

    # 分支 1：空标签（同时容忍 None 与空列表）
    if not user_tags:
        return fallback

    wanted = set(user_tags)

    # 分支 2：标签有交集则命中，按原顺序收集并天然去重
    matched: List[Dict] = []
    seen = set()
    for book in library:
        if wanted & set(book.get("tags", [])):
            title = book.get("title")
            if title not in seen:
                seen.add(title)
                matched.append(book)

    # 分支 3：有标签但零匹配 -> 兜底
    return matched if matched else fallback


# ---------------------------------------------------------------- harness 支架

def titles_of(books: Sequence[Dict]) -> List[str]:
    """取出书籍列表的书名，便于断言比对。"""
    return [book["title"] for book in books]


def assert_titles(actual: Sequence[Dict], expected: Sequence[str], message: str) -> None:
    """断言推荐结果的书名列表（含顺序）与期望一致。"""
    assert titles_of(actual) == list(expected), (
        "%s：期望 %s，实际 %s" % (message, list(expected), titles_of(actual))
    )


def run_case(name: str, case_func: Callable[[], None]) -> bool:
    """执行单条用例：assert 全部通过打印 [PASS]，否则打印 [FAIL] 及原因。"""
    try:
        case_func()
    except AssertionError as err:
        print("[FAIL] %s -> %s" % (name, err))
        return False
    print("[PASS] %s" % name)
    return True


# ---------------------------------------------------------------- 测试用例

def case_matched_tags() -> None:
    """用例 1：用户有可匹配借阅标签 -> 返回标签重合的书籍。"""
    user_tags = ["编程", "硬核"]
    result = recommend_books(user_tags)

    # 主约束：命中《算法导论》(编程/硬核) 与《代码整洁之道》(编程)、《三体》(硬核)，按书库顺序
    assert_titles(result,
                  ["三体", "代码整洁之道", "算法导论"],
                  "有匹配标签时应返回标签重合书籍")

    # 分支语义约束：返回结果不得为兜底热门书单
    assert titles_of(result) != titles_of(HOT_BOOKS), "匹配成功时不应回退到 hot_books"

    # 约束：每本书至少与用户标签有一个重合
    wanted = set(user_tags)
    for book in result:
        assert wanted & set(book["tags"]), "%s 与用户标签无重合" % book["title"]


def case_empty_tags() -> None:
    """用例 2：用户无借阅记录（空标签）-> 直接返回 hot_books。"""
    result = recommend_books([])

    # 主约束：内容等价于兜底热门书单
    assert_titles(result, titles_of(HOT_BOOKS), "空标签时应直接返回 hot_books")

    # 边界：None 同样视为无借阅记录
    assert_titles(recommend_books(None), titles_of(HOT_BOOKS), "None 标签也应返回 hot_books")


def case_unknown_tags() -> None:
    """用例 3：用户标签在书库完全不存在 -> 兜底返回 hot_books。"""
    result = recommend_books(["园艺", "烘焙"])

    # 主约束：无匹配时回退热门书单
    assert_titles(result, titles_of(HOT_BOOKS), "无匹配书籍时应回退 hot_books")

    # 分支语义约束：确实不存在任何重合书籍（确认用例前提成立）
    wanted = {"园艺", "烘焙"}
    assert all(not (wanted & set(b["tags"])) for b in BOOK_LIBRARY), "该标签不应在书库中存在"


def main() -> int:
    cases = [
        ("用例1: 用户有可匹配借阅标签", case_matched_tags),
        ("用例2: 用户无借阅记录(空标签)", case_empty_tags),
        ("用例3: 用户标签在书库完全不存在", case_unknown_tags),
    ]

    print("=" * 50)
    print("图书馆书籍推荐算法 harness 测试")
    print("=" * 50)

    passed = 0
    for name, func in cases:
        if run_case(name, func):
            passed += 1
    total = len(cases)

    print("-" * 50)
    print("汇总：%d/%d 条用例通过" % (passed, total))
    if passed == total:
        print("全部用例执行成功")
        return 0
    print("存在 %d 条用例失败" % (total - passed))
    return 1


if __name__ == "__main__":
    sys.exit(main())
