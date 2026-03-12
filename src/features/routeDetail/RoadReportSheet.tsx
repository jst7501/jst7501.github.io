import React, { useState } from 'react';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { RoadConditionType } from '../../types/route';
import { Tag } from '../../components/ui/Tag';
import { useToastStore } from '../../components/ui/Toast';

const CONDITIONS: RoadConditionType[] = ['포트홀', '블랙아이스', '낙엽', '공사', '젖은노면', '모래/자갈'];

interface RoadReportSheetProps {
  routeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoadReportSheet({ routeId, isOpen, onClose }: RoadReportSheetProps) {
  const [selectedType, setSelectedType] = useState<RoadConditionType | ''>('');
  const [description, setDescription] = useState('');
  const { addToast } = useToastStore();

  const handleSubmit = () => {
    if (!selectedType) return;
    
    // UI logic only MVP
    addToast('위험 노면이 제보되었습니다.', '안전 운전에 도움을 주셔서 감사합니다.', 'success');
    setSelectedType('');
    setDescription('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="위험 노면 제보">
      <div className="flex flex-col gap-6 w-full">
        
        {/* Warning Banner */}
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-3 w-full">
          <span className="text-warning text-lg mt-0.5">⚠️</span>
          <div>
            <h4 className="text-warning font-bold text-sm mb-1">허위 제보 주의</h4>
            <p className="text-warning/70 text-xs">안전과 직결된 정보입니다. 정확한 사실만 제보해 주세요.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            위험 유형 선택 <span className="text-error">*</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {CONDITIONS.map(cond => (
              <Tag 
                key={cond}
                active={selectedType === cond}
                onClick={() => setSelectedType(cond)}
                className="py-2.5 px-4"
              >
                {cond}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
            상세 설명 <span className="text-text-tertiary font-normal text-xs ml-1">(선택)</span>
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-surface-elevated text-white placeholder-text-tertiary rounded-2xl p-4 border border-border-strong focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none"
            placeholder="예: 북악 스카이웨이 두번째 헤어핀 진입 직전 아웃라인에 깊은 포트홀"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!selectedType}
          className="w-full py-4 mt-2 rounded-[20px] bg-primary text-white font-black text-lg disabled:opacity-50 disabled:bg-bg-surface-elevated disabled:text-text-tertiary transition-all shadow-[0_10px_30px_rgba(255,90,0,0.3)] disabled:shadow-none"
        >
          제보 전송하기
        </button>
      </div>
    </BottomSheet>
  );
}
