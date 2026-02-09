#!/bin/bash
# QMD Search Wrapper for Tawkie
# Usage: ./qmd-search "your query"

# Check if query is provided
if [ -z "$1" ]; then
    echo "Usage: ./qmd-search \"your query\""
    echo ""
    echo "Examples:"
    echo "  ./qmd-search \"ElevenLabs API key\""
    echo "  ./qmd-search \"memory management\""
    echo "  ./qmd-search \"Moltbook credentials\""
    exit 1
fi

cd ~/dev/tawkie

echo "🔍 Searching knowledge base for: $1"
echo ""
echo "=== Keyword Search (BM25) ==="
qmd search "$1" --files --min-score 0.2

echo ""
echo "=== Semantic Search (Vector) ==="
qmd vsearch "$1" --files --min-score 0.2 2>/dev/null || echo "(reranker model downloading...)"

echo ""
echo "=== Full Query (Hybrid + Rerank) ==="
qmd query "$1" --files --min-score 0.2 2>/dev/null || echo "(reranker model downloading...)"
