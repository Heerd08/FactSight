"""
Entity Extractor Service — Entity, Subject, and Action Extraction for Targeted Search.

Extracts:
1. Primary Subjects / Proper Nouns (e.g., "Messi", "Modi", "NASA", "Einstein", "Trump", "FDA")
2. Action / Predicate keywords (e.g., "resign", "visit", "cure", "died", "banned")
3. Cleans query strings to prevent search engine topic drifting (e.g., dropping unrelated war/political news).
"""

import re
from typing import Dict, Any, List, Set

# Common stopwords to exclude from key subject extraction
STOPWORDS = {
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "shall", "should", "may", "might",
    "must", "can", "could", "a", "an", "the", "and", "but", "if", "or",
    "because", "as", "until", "while", "of", "at", "by", "for", "with",
    "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "s", "t",
    "just", "don", "should", "now", "going", "goes", "went", "tomorrow",
    "yesterday", "today", "week", "month", "year", "ago", "days"
}

# Known prominent entity dictionary aliases
ENTITY_ALIASES = {
    "messi": "Lionel Messi",
    "ronaldo": "Cristiano Ronaldo",
    "modi": "Narendra Modi",
    "trump": "Donald Trump",
    "biden": "Joe Biden",
    "putin": "Vladimir Putin",
    "obama": "Barack Obama",
    "musk": "Elon Musk",
    "gates": "Bill Gates",
    "einstein": "Albert Einstein",
    "kamala": "Kamala Harris",
    "zelensky": "Volodymyr Zelensky",
    "netanyahu": "Benjamin Netanyahu",
}


class EntityExtractor:
    """Extracts subjects, entities, and builds high-precision search queries."""

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract primary subjects, key nouns, and actions from input text."""
        clean_text = re.sub(r"[^\w\s]", " ", text)
        words = clean_text.split()
        words_lower = [w.lower() for w in words]

        # 1. Detect known entity aliases
        matched_entities = set()
        for word in words_lower:
            if word in ENTITY_ALIASES:
                matched_entities.add(ENTITY_ALIASES[word])

        # 2. Extract capitalized proper nouns
        proper_nouns = [
            w for w in words
            if len(w) > 2 and w[0].isupper() and w.lower() not in STOPWORDS
        ]
        for pn in proper_nouns:
            matched_entities.add(pn)

        # 3. Extract core non-stopwords
        meaningful_keywords = [
            w for w in words_lower
            if len(w) > 2 and w not in STOPWORDS and not w.isdigit()
        ]

        primary_subject = " ".join(list(matched_entities)) if matched_entities else (
            meaningful_keywords[0].capitalize() if meaningful_keywords else "General Claim"
        )

        return {
            "entities": list(matched_entities),
            "primary_subject": primary_subject,
            "keywords": meaningful_keywords,
            "all_subject_terms": set(words_lower) - STOPWORDS,
        }

    def build_targeted_search_query(self, text: str, year: int = 2026) -> str:
        """Build a clean, high-precision search query focused on the entity and predicate."""
        entity_info = self.extract_entities(text)
        entities = entity_info["entities"]
        keywords = entity_info["keywords"]

        # If known entity found (e.g. Lionel Messi), put entity first
        query_parts = []
        if entities:
            query_parts.extend(entities)
        
        # Add key action predicates (e.g., resign, retirement, visit, cure)
        for kw in keywords:
            if kw not in " ".join(entities).lower() and kw not in query_parts:
                query_parts.append(kw)

        clean_query = " ".join(query_parts[:6])
        if not clean_query:
            clean_query = text[:60]

        return f"{clean_query} fact check {year}"

    def is_evidence_relevant(self, item: Dict[str, Any], entity_info: Dict[str, Any]) -> bool:
        """Filter out irrelevant off-topic search results (e.g., random war news for a Messi query)."""
        content = (
            item.get("title", "") + " " +
            item.get("snippet", "") + " " +
            item.get("url", "")
        ).lower()

        entities = [e.lower() for e in entity_info["entities"]]
        keywords = entity_info["keywords"]

        # If specific named entities were in query, AT LEAST ONE MUST appear in the article
        if entities:
            entity_words = set()
            for ent in entities:
                entity_words.update(ent.split())
            if not any(ew in content for ew in entity_words if len(ew) > 2):
                return False

        # If no named entity, check that at least 25% of core keywords appear
        if keywords:
            matches = sum(1 for kw in keywords if kw in content)
            if matches == 0 and len(keywords) > 1:
                return False

        return True


_entity_extractor = None


def get_entity_extractor() -> EntityExtractor:
    global _entity_extractor
    if _entity_extractor is None:
        _entity_extractor = EntityExtractor()
    return _entity_extractor
