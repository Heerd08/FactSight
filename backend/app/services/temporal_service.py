"""
Temporal Intelligence Service — Real-Time Date Grounding, Calendar Math, Leap Years & Holiday Verification.

Features:
1. Real-Time Calendar Grounding (Current Year, Month, Day, Day of Week).
2. Deterministic Leap Year & Date Arithmetic.
3. Deterministic Fixed-Date Holiday & Astronomical Verification (e.g. Gandhi Jayanti, Solstices, Equinoxes, Valentine's, Independence Day).
4. Relative Date & Weekday Resolution (Today, Tomorrow, Next Day, Following Day, Yesterday, Day After Tomorrow, Next Month, Next Year).
5. Stale Historical News & Future Rumor Filtering.
"""

import re
import datetime
from typing import Dict, Any, List, Optional, Tuple

TEMPORAL_FUTURE_PATTERNS = [
    r"\btomm?orr?ow\b", r"\bnext\s*day\b", r"\bfollowing\s*day\b", r"\bnext\s*week\b",
    r"\bnext\s*month\b", r"\bnext\s*year\b", r"\bin \d+ days?\b", r"\bin a few days\b",
    r"\bupcoming\b", r"\bsoon\b", r"\bwill go\b", r"\bwill visit\b", r"\bwill die\b",
    r"\bwill resign\b", r"\bwill erupt\b", r"\bgoing to\b", r"\bscheduled to\b"
]

TEMPORAL_PAST_PATTERNS = [
    r"\byester?day\b", r"\bprevious\s*day\b", r"\blast week\b", r"\blast month\b",
    r"\blast year\b", r"\brecently\b", r"\bjust now\b", r"\bhas died\b", r"\bpassed away today\b"
]

# Annual Fixed-Date Holidays & Observances (Regex Pattern, Month, Day, Canonical Name, Official Date String)
KNOWN_FIXED_HOLIDAYS = [
    (r"\bvalentines?(\s*day)?\b", 2, 14, "Valentine's Day", "February 14"),
    (r"\bindependence\s*day\s*(in\s*india|of\s*india|india)?\b", 8, 15, "Indian Independence Day", "August 15"),
    (r"\brepublic\s*day\s*(in\s*india|of\s*india|india)?\b", 1, 26, "Indian Republic Day", "January 26"),
    (r"\bchristmas(\s*day)?\b", 12, 25, "Christmas Day", "December 25"),
    (r"\bchristmas\s*eve\b", 12, 24, "Christmas Eve", "December 24"),
    (r"\bnew\s*years?(\s*day)?\b", 1, 1, "New Year's Day", "January 1"),
    (r"\bnew\s*years?\s*eve\b", 12, 31, "New Year's Eve", "December 31"),
    (r"\bhalloween\b", 10, 31, "Halloween", "October 31"),
    (r"\bgandhi\s*jayanti\b", 10, 2, "Gandhi Jayanti", "October 2"),
    (r"\b(4th\s*of\s*july|fourth\s*of\s*july|us\s*independence\s*day)\b", 7, 4, "US Independence Day", "July 4"),
    (r"\b(may\s*day|international\s*workers?\s*day|labor\s*day\s*global)\b", 5, 1, "May Day / International Workers' Day", "May 1"),
    (r"\bearth\s*day\b", 4, 22, "Earth Day", "April 22"),
    (r"\bapril\s*fools?(\s*day)?\b", 4, 1, "April Fools' Day", "April 1"),
    (r"\b(international\s*)?womens?\s*day\b", 3, 8, "International Women's Day", "March 8"),
    (r"\bpi\s*day\b", 3, 14, "Pi Day", "March 14"),
    (r"\bst\.?\s*patricks?\s*day\b", 3, 17, "St. Patrick's Day", "March 17"),
    (r"\bteachers?\s*day\s*(in\s*india|of\s*india|india)?\b", 9, 5, "Teachers' Day (India)", "September 5"),
    (r"\bnational\s*science\s*day\b", 2, 28, "National Science Day (India)", "February 28"),
    (r"\b(worlds?\s*)?(longest\s*day(\s*of\s*the\s*year)?|summer\s*solstice)\b", 6, 21, "Summer Solstice (Longest Day of the Year)", "June 20-21"),
    (r"\b(worlds?\s*)?(shortest\s*day(\s*of\s*the\s*year)?|winter\s*solstice)\b", 12, 21, "Winter Solstice (Shortest Day of the Year)", "December 21-22"),
    (r"\b(autumnal?|fall)\s*equinox\b", 9, 22, "Autumnal Equinox", "September 22-23"),
    (r"\b(vernal|spring)\s*equinox\b", 3, 20, "Vernal Equinox", "March 20-21"),
]


class TemporalService:
    """Provides temporal grounding, calendar arithmetic, and holiday validation."""

    def __init__(self):
        pass

    def get_current_context(self) -> Dict[str, Any]:
        """Get current real-time timestamp and formatted strings."""
        now = datetime.datetime.now()
        tomorrow = now + datetime.timedelta(days=1)
        yesterday = now - datetime.timedelta(days=1)
        return {
            "datetime": now,
            "year": now.year,
            "month": now.month,
            "day": now.day,
            "month_name": now.strftime("%B"),
            "formatted_date": now.strftime("%B %d, %Y"),
            "today_full": now.strftime("%A, %B %d, %Y"),
            "tomorrow_full": tomorrow.strftime("%A, %B %d, %Y"),
            "yesterday_full": yesterday.strftime("%A, %B %d, %Y"),
            "tomorrow_date": (tomorrow.month, tomorrow.day),
            "yesterday_date": (yesterday.month, yesterday.day),
            "today_date": (now.month, now.day),
            "current_month_year": now.strftime("%B %Y"),
            "iso": now.isoformat(),
        }

    def check_calendar_or_math_claim(self, text: str) -> Optional[Dict[str, Any]]:
        """Verify calendar, weekday, leap year, or holiday claims deterministically."""
        text_lower = text.lower()
        now_ctx = self.get_current_context()
        cur_year = now_ctx["year"]
        now_dt = now_ctx["datetime"]

        # 1. Leap Year Claims (e.g. "next year will be a leap year", "2026 is a leap year", "2028 is a leap year")
        if re.search(r"\bleap\s*years?\b", text_lower):
            if "next year" in text_lower:
                target_year = cur_year + 1
                year_label = f"Next year ({target_year})"
            elif "last year" in text_lower:
                target_year = cur_year - 1
                year_label = f"Last year ({target_year})"
            elif "this year" in text_lower:
                target_year = cur_year
                year_label = f"This year ({target_year})"
            else:
                years = [int(y) for y in re.findall(r"\b(20\d\d|19\d\d)\b", text)]
                if years:
                    target_year = years[0]
                    year_label = f"The year {target_year}"
                else:
                    target_year = cur_year
                    year_label = f"The year {target_year}"

            is_leap = (target_year % 4 == 0 and (target_year % 100 != 0 or target_year % 400 == 0))
            
            # Find next upcoming leap year
            temp_y = target_year if is_leap else target_year + 1
            while not (temp_y % 4 == 0 and (temp_y % 100 != 0 or temp_y % 400 == 0)):
                temp_y += 1
            next_leap = temp_y

            # Check if user asserted negation
            is_negative_claim = bool(re.search(r"\b(not|isnt|isn't|never|won't|wont)\b", text_lower))
            claim_matches = (not is_negative_claim and is_leap) or (is_negative_claim and not is_leap)

            if claim_matches:
                return {
                    "is_holiday_claim": True,
                    "is_valid": True,
                    "holiday_name": f"Leap Year Calculation ({target_year})",
                    "official_date": f"{target_year}",
                    "claimed_date": year_label,
                    "verdict": "Genuine",
                    "credibility_score_pct": 98,
                    "confidence": 0.99,
                    "explanation": (
                        f"Calendar & Mathematical Ground Truth: {year_label} is {'indeed a' if is_leap else 'NOT a'} leap year. "
                        f"The statement is **Genuine and Mathematically Accurate**."
                    ),
                }
            else:
                return {
                    "is_holiday_claim": True,
                    "is_valid": False,
                    "holiday_name": f"Leap Year Calculation ({target_year})",
                    "official_date": f"{target_year}",
                    "claimed_date": year_label,
                    "verdict": "Fake",
                    "credibility_score_pct": 2,
                    "confidence": 0.99,
                    "explanation": (
                        f"Calendar & Mathematical Ground Truth: {year_label} is {'a' if is_leap else 'NOT a'} leap year (the next leap year is {next_leap}). "
                        f"The claim asserting that {year_label} is a leap year is **Fake**."
                    ),
                }

        # 2. Relative Month Claims (e.g. "next month is gandhi jayanti", "next month is valentines day")
        if re.search(r"\bnext\s*month\b", text_lower):
            next_month = (now_dt.month % 12) + 1
            next_month_name = datetime.date(now_dt.year, next_month, 1).strftime("%B")
            for pattern, h_month, h_day, h_name, h_date_str in KNOWN_FIXED_HOLIDAYS:
                if re.search(pattern, text_lower):
                    is_correct = (next_month == h_month)
                    if is_correct:
                        return {
                            "is_holiday_claim": True,
                            "is_valid": True,
                            "holiday_name": h_name,
                            "official_date": h_date_str,
                            "claimed_date": f"next month ({next_month_name})",
                            "verdict": "Genuine",
                            "credibility_score_pct": 98,
                            "confidence": 0.99,
                            "explanation": (
                                f"Calendar Verification: **{h_name}** occurs in {next_month_name} ({h_date_str}). "
                                f"The statement claiming next month is {h_name} is **Genuine**."
                            ),
                        }
                    else:
                        return {
                            "is_holiday_claim": True,
                            "is_valid": False,
                            "holiday_name": h_name,
                            "official_date": h_date_str,
                            "claimed_date": f"next month ({next_month_name})",
                            "verdict": "Fake",
                            "credibility_score_pct": 2,
                            "confidence": 0.99,
                            "explanation": (
                                f"Calendar Verification: **{h_name}** is celebrated on **{h_date_str}**, not in {next_month_name}. "
                                f"The statement claiming next month is {h_name} is **Fake**."
                            ),
                        }

        # 3. Relative Date Resolution with all Synonyms (tomorrow, next day, day after today, in 2 days, etc.)
        target_offset = None
        target_label = ""

        if re.search(r"\b(day\s*after\s*tomm?orr?ow|in\s*2\s*days|after\s*2\s*days|in\s*two\s*days)\b", text_lower):
            target_offset = 2
            target_label = "the day after tomorrow"
        elif re.search(r"\b(tomm?orr?ow|next\s*day|the\s*next\s*day|following\s*day|the\s*following\s*day|day\s*after\s*today|in\s*1\s*day)\b", text_lower):
            target_offset = 1
            target_label = "the next day"
        elif re.search(r"\b(yester?day|previous\s*day|the\s*previous\s*day|day\s*before\s*today|1\s*day\s*ago)\b", text_lower):
            target_offset = -1
            target_label = "yesterday"
        elif re.search(r"\b(today|this\s*day|present\s*day|right\s*now)\b", text_lower):
            target_offset = 0
            target_label = "today"

        if target_offset is None:
            return None

        claimed_dt = now_dt + datetime.timedelta(days=target_offset)
        claimed_full = claimed_dt.strftime("%A, %B %d, %Y")
        claimed_month_day = (claimed_dt.month, claimed_dt.day)
        claimed_weekday = claimed_dt.strftime("%A").lower()

        # 4. Day of Week Claims (e.g. "next day will be saturday", "tomorrow is sunday")
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for day_name in weekdays:
            if re.search(r"\b" + day_name + r"\b", text_lower):
                is_correct = (day_name == claimed_weekday)
                claimed_desc = f"{target_label} is {day_name.capitalize()}"
                actual_desc = f"{target_label} is {claimed_full}"
                if is_correct:
                    return {
                        "is_holiday_claim": True,
                        "is_valid": True,
                        "holiday_name": f"Day of the Week ({day_name.capitalize()})",
                        "official_date": actual_desc,
                        "claimed_date": claimed_desc,
                        "verdict": "Genuine",
                        "credibility_score_pct": 98,
                        "confidence": 0.99,
                        "explanation": (
                            f"Calendar Verification: The statement claiming that {claimed_desc} is **Genuine and Accurate**. "
                            f"The current system calendar confirms {actual_desc}."
                        ),
                    }
                else:
                    return {
                        "is_holiday_claim": True,
                        "is_valid": False,
                        "holiday_name": f"Day of the Week ({day_name.capitalize()})",
                        "official_date": actual_desc,
                        "claimed_date": claimed_desc,
                        "verdict": "Fake",
                        "credibility_score_pct": 2,
                        "confidence": 0.99,
                        "explanation": (
                            f"Calendar Verification: The statement claiming that {claimed_desc} is **Fake**. "
                            f"In reality, {actual_desc}."
                        ),
                    }

        # 5. Check against known fixed annual holidays & astronomical events
        for pattern, h_month, h_day, h_name, h_date_str in KNOWN_FIXED_HOLIDAYS:
            if re.search(pattern, text_lower):
                is_correct = (claimed_month_day == (h_month, h_day))
                if is_correct:
                    return {
                        "is_holiday_claim": True,
                        "is_valid": True,
                        "holiday_name": h_name,
                        "official_date": h_date_str,
                        "claimed_date": f"{target_label} ({claimed_full})",
                        "verdict": "Genuine",
                        "credibility_score_pct": 98,
                        "confidence": 0.99,
                        "explanation": (
                            f"Calendar Verification: **{h_name}** is celebrated annually on **{h_date_str}**. "
                            f"The current calendar confirms {target_label} ({claimed_full}) corresponds exactly to {h_name}."
                        ),
                    }
                else:
                    return {
                        "is_holiday_claim": True,
                        "is_valid": False,
                        "holiday_name": h_name,
                        "official_date": h_date_str,
                        "claimed_date": f"{target_label} ({claimed_full})",
                        "verdict": "Fake",
                        "credibility_score_pct": 2,
                        "confidence": 0.99,
                        "explanation": (
                            f"Calendar Verification: **{h_name}** is celebrated annually on **{h_date_str}**. "
                            f"The statement claiming {target_label} ({claimed_full}) is {h_name} is factually false."
                        ),
                    }

        return None

    def check_fixed_calendar_holiday(self, text: str) -> Optional[Dict[str, Any]]:
        """Alias for check_calendar_or_math_claim for backward compatibility."""
        return self.check_calendar_or_math_claim(text)

    def extract_temporal_anchors(self, text: str) -> Dict[str, Any]:
        """Analyze text to identify if it references a time-sensitive, future, or past event."""
        text_lower = text.lower()
        now_ctx = self.get_current_context()

        is_future = any(re.search(pat, text_lower) for pat in TEMPORAL_FUTURE_PATTERNS)
        is_past = any(re.search(pat, text_lower) for pat in TEMPORAL_PAST_PATTERNS)

        years_mentioned = [int(y) for y in re.findall(r"\b(201\d|202\d|203\d)\b", text)]

        relative_keywords = []
        if re.search(r"\b(tomm?orr?ow|next\s*day)\b", text_lower):
            relative_keywords.append("tomorrow")
        if re.search(r"\btoday\b", text_lower):
            relative_keywords.append("today")
        if re.search(r"\b(yester?day|previous\s*day)\b", text_lower):
            relative_keywords.append("yesterday")
        if re.search(r"\bnext\s*month\b", text_lower):
            relative_keywords.append("next month")

        is_time_sensitive = is_future or is_past or bool(relative_keywords)

        return {
            "is_time_sensitive": is_time_sensitive,
            "is_future": is_future,
            "is_past": is_past,
            "relative_keywords": relative_keywords,
            "years_mentioned": years_mentioned,
            "current_year": now_ctx["year"],
            "current_date_str": now_ctx["formatted_date"],
            "today_full": now_ctx["today_full"],
            "tomorrow_full": now_ctx["tomorrow_full"],
        }


_temporal_service = None


def get_temporal_service() -> TemporalService:
    global _temporal_service
    if _temporal_service is None:
        _temporal_service = TemporalService()
    return _temporal_service
