import React, { useState } from 'react';

interface Rule {
  field: string;
  operator: string;
  value: string;
  logic: 'AND' | 'OR';
}

const fields = [
  { label: 'Spend', value: 'spend' },
  { label: 'Visits', value: 'visits' },
  { label: 'Inactive Days', value: 'inactiveDays' },
];
const operators = ['>', '>=', '<', '<=', '=', '!='];

// Use CampaignForm type from CampaignCreator
interface CampaignForm {
  name: string;
  type: 'email' | 'sms' | 'push';
  content: {
    subject?: string;
    message: string;
    template?: string;
  };
  targeting: {
    segments: string[];
    filters: Record<string, unknown>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    scheduledAt?: string;
  };
}

interface RuleBuilderProps {
  setCampaign: React.Dispatch<React.SetStateAction<CampaignForm>>;
}

export const RuleBuilder = ({ setCampaign }: RuleBuilderProps) => {
  const [rules, setRules] = useState<Rule[]>([]);

  const addRule = () => {
    setRules([...rules, { field: 'spend', operator: '>', value: '', logic: 'AND' }]);
  };
  const updateRule = (idx: number, key: keyof Rule, val: string) => {
    setRules(rules.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  };
  const removeRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };
  // Update campaign filters on rules change
  React.useEffect(() => {
    // Convert rules to MongoDB query
    const query: Record<string, unknown> = {};
    rules.forEach(rule => {
      if (rule.logic === 'AND') {
        query[rule.field] = { [rule.operator]: rule.value };
      }
    });
    setCampaign(prev => ({ ...prev, targeting: { ...prev.targeting, filters: query } }));
  }, [rules, setCampaign]);

  return (
    <div className="space-y-2">
      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <select value={rule.field} onChange={e => updateRule(idx, 'field', e.target.value)} className="border rounded px-2 py-1">
            {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={rule.operator} onChange={e => updateRule(idx, 'operator', e.target.value)} className="border rounded px-2 py-1">
            {operators.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input value={rule.value} onChange={e => updateRule(idx, 'value', e.target.value)} className="border rounded px-2 py-1 w-20" placeholder="Value" />
          <select value={rule.logic} onChange={e => updateRule(idx, 'logic', e.target.value)} className="border rounded px-2 py-1">
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
          <button onClick={() => removeRule(idx)} className="text-red-500">Remove</button>
        </div>
      ))}
      <button onClick={addRule} className="px-2 py-1 bg-green-600 text-white rounded">Add Rule</button>
    </div>
  );
};