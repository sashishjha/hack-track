import { FilterGroup, FilterRule, isFilterGroup } from '@/lib/types';
import { SKILL_DOMAIN_LABELS, DIFFICULTY_LABELS, EFFORT_LEVEL_LABELS } from '@/lib/constants';

interface Props {
  group: FilterGroup | null;
  onChange: (group: FilterGroup | null) => void;
}

const FIELDS = {
  skillDomains: 'Skill Domain',
  difficulty: 'Difficulty',
  effortLevel: 'Effort Level',
  status: 'Status (open/closed)',
  prizePoolUsd: 'Prize Pool ($)',
  rarityScore: 'ROI Score',
  apiCreditsIncluded: 'Free API Credits',
  gpuCreditsIncluded: 'Free GPU Credits',
};

const OPERATORS = {
  '==': 'Equals',
  '!=': 'Not Equals',
  'contains': 'Contains',
  'not_contains': 'Does Not Contain',
  '>': 'Greater Than',
  '<': 'Less Than',
  'is_true': 'Is True',
  'is_false': 'Is False',
};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function AdvancedFilterBuilder({ group, onChange }: Props) {
  if (!group) {
    return (
      <div className="flex justify-center py-4">
        <button
          onClick={() => onChange({ id: generateId(), combinator: 'AND', rules: [] })}
          className="px-4 py-2 bg-[#1e2d45] hover:bg-[#2c3d5a] text-[#00e5a0] text-xs font-mono uppercase tracking-wider rounded transition-colors"
        >
          + Initialize Advanced Query
        </button>
      </div>
    );
  }

  const updateGroup = (newGroup: FilterGroup) => {
    onChange(newGroup);
  };

  return (
    <div className="p-4 bg-[#07090f] border border-[#1e2d45] rounded-lg mt-4 animate-fade-in">
      <GroupEditor group={group} onChange={updateGroup} isRoot={true} onRemove={() => onChange(null)} />
    </div>
  );
}

function GroupEditor({ group, onChange, isRoot, onRemove }: { group: FilterGroup, onChange: (g: FilterGroup) => void, isRoot?: boolean, onRemove: () => void }) {
  const addRule = () => {
    onChange({
      ...group,
      rules: [...group.rules, { id: generateId(), field: 'skillDomains', operator: '==', value: '' }],
    });
  };

  const addSubGroup = () => {
    onChange({
      ...group,
      rules: [...group.rules, { id: generateId(), combinator: 'AND', rules: [] }],
    });
  };

  const updateRule = (id: string, updatedRule: FilterRule | FilterGroup) => {
    onChange({
      ...group,
      rules: group.rules.map(r => r.id === id ? updatedRule : r)
    });
  };

  const removeRule = (id: string) => {
    onChange({
      ...group,
      rules: group.rules.filter(r => r.id !== id)
    });
  };

  const toggleCombinator = () => {
    onChange({ ...group, combinator: group.combinator === 'AND' ? 'OR' : 'AND' });
  };

  return (
    <div className={`flex flex-col gap-3 ${!isRoot ? 'pl-4 border-l border-[#1e2d45] ml-2 mt-2' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCombinator}
          className="px-2 py-1 bg-[#0d1120] border border-[#1e2d45] text-[#00e5a0] text-[10px] font-mono font-bold rounded hover:border-[#00e5a0] transition-colors"
        >
          {group.combinator}
        </button>
        <div className="flex gap-2 ml-auto">
          <button onClick={addRule} className="text-[10px] text-[#6b7a99] uppercase tracking-wider hover:text-[#00e5a0] transition-colors">+ Rule</button>
          <button onClick={addSubGroup} className="text-[10px] text-[#6b7a99] uppercase tracking-wider hover:text-[#4d9fff] transition-colors">+ Group</button>
          <button onClick={onRemove} className="text-[10px] text-[#ff5c35] uppercase tracking-wider hover:underline ml-2">Remove</button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {group.rules.map(rule => (
          isFilterGroup(rule) ? (
            <GroupEditor key={rule.id} group={rule} onChange={g => updateRule(rule.id, g)} onRemove={() => removeRule(rule.id)} />
          ) : (
            <RuleEditor key={rule.id} rule={rule} onChange={r => updateRule(rule.id, r)} onRemove={() => removeRule(rule.id)} />
          )
        ))}
        {group.rules.length === 0 && (
          <span className="text-[10px] text-[#3d4655] font-mono italic">Empty group</span>
        )}
      </div>
    </div>
  );
}

function RuleEditor({ rule, onChange, onRemove }: { rule: FilterRule, onChange: (r: FilterRule) => void, onRemove: () => void }) {
  const needsValueInput = !['is_true', 'is_false'].includes(rule.operator);

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#0d1120] p-2 rounded border border-[#1e2d45]">
      <select
        value={rule.field}
        onChange={e => onChange({ ...rule, field: e.target.value })}
        className="bg-transparent border border-[#1e2d45] text-[#e8edf5] text-[11px] font-mono px-2 py-1 rounded outline-none focus:border-[#00e5a0]"
      >
        {Object.entries(FIELDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      <select
        value={rule.operator}
        onChange={e => onChange({ ...rule, operator: e.target.value as any })}
        className="bg-transparent border border-[#1e2d45] text-[#00e5a0] text-[11px] font-mono px-2 py-1 rounded outline-none focus:border-[#00e5a0]"
      >
        {Object.entries(OPERATORS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>

      {needsValueInput && (
        <input
          type="text"
          value={rule.value as string}
          onChange={e => onChange({ ...rule, value: e.target.value })}
          placeholder="value..."
          className="bg-transparent border border-[#1e2d45] text-[#e8edf5] text-[11px] font-mono px-2 py-1 rounded outline-none focus:border-[#00e5a0] flex-1 min-w-[100px]"
        />
      )}

      <button onClick={onRemove} className="text-[#6b7a99] hover:text-[#ff5c35] p-1 ml-auto">
        ✕
      </button>
    </div>
  );
}
