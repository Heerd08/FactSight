import React from 'react';
import {
  ShieldCheck,
  Brain,
  Database,
  Layers,
  Sparkles,
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Claim Decomposition & Preprocessing',
      desc: 'When content is submitted, FactSight extracts assertions, entities, dates, and emotional manipulation markers.',
      icon: Layers,
    },
    {
      num: '02',
      title: 'Neural Classification (DeBERTa-v3)',
      desc: 'Our fine-tuned Transformer model predicts initial classification (Genuine, Misleading, Fake) and calculates output confidence probabilities.',
      icon: Brain,
    },
    {
      num: '03',
      title: 'Semantic Vector Retrieval (ChromaDB RAG)',
      desc: 'Using sentence-transformers, the claim is projected into dense vector space (384 dimensions) to retrieve top matching fact-checks from Reuters, WHO, NASA, and accredited databases.',
      icon: Database,
    },
    {
      num: '04',
      title: 'Credibility Synthesis & Explainable AI',
      desc: 'The system combines neural classification confidence with vector similarity distances to produce a unified 1-100 Credibility Score, audit trail, and transparent rationale.',
      icon: Sparkles,
    }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      <div className="pb-2 border-b border-slate-200/60">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Architecture & Methodology
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          How FactSight AI Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          A hybrid neural pipeline combining DeBERTa-v3 classification, RAG vector retrieval, and dual SQL/Vector databases.
        </p>
      </div>

      {/* 4 Architectural Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.num} hover className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-mono font-extrabold text-indigo-200">{s.num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dual Database Architecture Card */}
      <Card header={<h3 className="text-sm font-bold text-slate-800">Dual-Database System</h3>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Database 1: Relational SQL</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Stores Users, Analysis History, Saved Reports, User Feedback, and Audit Logs with ACID guarantees.
            </p>
            <span className="text-[11px] font-mono text-slate-500">SQLAlchemy + SQLite / PostgreSQL</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Database 2: Vector DB (RAG)</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Stores verified benchmark fact-checks with dense cosine similarity embeddings for instant semantic search.
            </p>
            <span className="text-[11px] font-mono text-slate-500">ChromaDB + all-MiniLM-L6-v2</span>
          </div>
        </div>
      </Card>

      <div className="pt-4 text-center">
        <Link to="/dashboard">
          <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
            Try It on the Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
