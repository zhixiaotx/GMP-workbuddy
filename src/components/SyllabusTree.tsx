import React from 'react';
import { Exercise } from '../types';
import { EXERCISES } from '../data';
import { CheckCircle2, Circle, GraduationCap, Calendar, Clock, Trophy } from 'lucide-react';

interface SyllabusTreeProps {
  exercises: Exercise[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function SyllabusTree({ exercises, activeId, onSelect }: SyllabusTreeProps) {
  const completedCount = exercises.filter((e) => e.completed).length;
  const progressPercent = Math.round((completedCount / exercises.length) * 100);

  // Group exercises by Day
  const day1Exercises = exercises.filter((e) => e.day === 1);
  const day2Exercises = exercises.filter((e) => e.day === 2);

  const getLectureHeaders = (exList: Exercise[]) => {
    const lectures: { [key: string]: Exercise[] } = {};
    exList.forEach((e) => {
      if (!lectures[e.lecture]) {
        lectures[e.lecture] = [];
      }
      lectures[e.lecture].push(e);
    });
    return lectures;
  };

  const day1Lectures = getLectureHeaders(day1Exercises);
  const day2Lectures = getLectureHeaders(day2Exercises);

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full">
      {/* Top Profile / Progress Card */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">GMP 智能体特训营</h3>
            <p className="text-xs text-slate-500">Workbuddy 模拟实操环境</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              实操进度: {completedCount} / {exercises.length}
            </span>
            <span className="font-semibold text-emerald-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Syllabus Content List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Day 1 Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            第一天：提示词 + 知识库 + Skill 导入
          </div>

          <div className="space-y-3">
            {Object.entries(day1Lectures).map(([lecture, items]) => (
              <div key={lecture} className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100/60 rounded">
                  {lecture}
                </div>
                <div className="space-y-0.5 pl-1">
                  {items.map((item) => {
                    const isActive = item.id === activeId;
                    return (
                      <button
                        key={item.id}
                        id={`syllabus-item-${item.id}`}
                        onClick={() => onSelect(item.id)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="text-xs">
                          <div className={`font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {item.title}
                          </div>
                          <p className="text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day 2 Section */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            第二天：专家团 + 自动化 + 自主实战
          </div>

          <div className="space-y-3">
            {Object.entries(day2Lectures).map(([lecture, items]) => (
              <div key={lecture} className="space-y-1">
                <div className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100/60 rounded">
                  {lecture}
                </div>
                <div className="space-y-0.5 pl-1">
                  {items.map((item) => {
                    const isActive = item.id === activeId;
                    return (
                      <button
                        key={item.id}
                        id={`syllabus-item-${item.id}`}
                        onClick={() => onSelect(item.id)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="text-xs">
                          <div className={`font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {item.title}
                          </div>
                          <p className="text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Schedule Footnote */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>课程时间: 9:00-12:00 | 13:30-16:30</span>
      </div>
    </div>
  );
}
