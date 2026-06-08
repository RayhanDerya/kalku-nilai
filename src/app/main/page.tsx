'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, Calculator, Award, ChevronRight, Menu, X, LayoutDashboard } from 'lucide-react';

type CourseComponent = {
  id: string;
  label: string;
  weight: number;
};

type Course = {
  id: string;
  name: string;
  defaultSks: number;
  components: CourseComponent[];
};

type GradeInfo = {
  letter: string;
  weight: number;
  color: string;
  bg: string;
};

type ScoreMatrix = Record<string, Record<string, number | ''>>;
type SksMap = Record<string, number>;
type ProgressPayload = {
  scores: Record<string, Record<string, number>>;
  sks: Record<string, number>;
};

const buildInitialScores = (courses: Course[], savedScores: ProgressPayload['scores'] = {}): ScoreMatrix => {
  const initialScores: ScoreMatrix = {};

  courses.forEach((course) => {
    initialScores[course.id] = {};
    course.components.forEach((component) => {
      initialScores[course.id][component.id] = savedScores[course.id]?.[component.id] ?? '';
    });
  });

  return initialScores;
};

const buildInitialSks = (courses: Course[], savedSks: ProgressPayload['sks'] = {}): SksMap => {
  const initialSks: SksMap = {};

  courses.forEach((course) => {
    initialSks[course.id] = savedSks[course.id] ?? course.defaultSks;
  });

  return initialSks;
};

// Data Skema Evaluasi Berdasarkan Gambar
const seedCoursesData: Course[] = [
  {
    id: 'bd',
    name: '1. Basis Data',
    defaultSks: 3,
    components: [
      { id: 'ti', label: 'Tugas Individu (Rata-rata 4x)', weight: 16 },
      { id: 'lab', label: 'Latihan Lab (Rata-rata 3x)', weight: 6 },
      { id: 'tk13', label: 'Tugas Kelompok 1-3 (Rata-rata)', weight: 12 },
      { id: 'tk4', label: 'Tugas Kelompok 4', weight: 6 },
      { id: 'quiz', label: 'Quiz (Rata-rata 2x)', weight: 10 },
      { id: 'uts', label: 'Ujian Tengah Semester (UTS)', weight: 25 },
      { id: 'uas', label: 'Ujian Akhir Semester (UAS)', weight: 25 },
    ]
  },
  {
    id: 'pkpl',
    name: '2. Pengantar Keamanan Perangkat Lunak',
    defaultSks: 3,
    components: [
      { id: 'gp', label: 'Group Project (Rata-rata 9x)', weight: 36 },
      { id: 'quiz', label: 'Weekly Individual Quiz', weight: 10 },
      { id: 'hadir', label: 'Kehadiran', weight: 4 },
      { id: 'uts', label: 'Midterm (UTS)', weight: 25 },
      { id: 'uas', label: 'Final (UAS)', weight: 25 },
    ]
  },
  {
    id: 'si',
    name: '3. Sistem Interaksi',
    defaultSks: 3,
    components: [
      { id: 'lk', label: 'Lembar Kerja (LK - 11 Dokumen)', weight: 20 },
      { id: 'proyek', label: 'Proyek Kelompok (Template & Presentasi)', weight: 30 },
      { id: 'kontribusi', label: 'Kontribusi Kelas', weight: 10 },
      { id: 'hadir', label: 'Kehadiran di Sesi Sinkronus', weight: 5 },
      { id: 'esai', label: 'Tugas Esai', weight: 5 },
      { id: 'uts', label: 'Ujian Tengah Semester', weight: 20 },
      { id: 'kuis', label: 'Kuis', weight: 10 },
    ]
  },
  {
    id: 'mpti',
    name: '4. Manajemen Proyek TI',
    defaultSks: 3,
    components: [
      { id: 'tk_plan', label: 'Tugas Kelompok Project Plan', weight: 15 },
      { id: 'ti1', label: 'Tugas Individu 1', weight: 9 },
      { id: 'ti2', label: 'Tugas Individu 2', weight: 10 },
      { id: 'kuis1', label: 'KUIS 1', weight: 5 },
      { id: 'kuis2', label: 'KUIS 2', weight: 5 },
      { id: 'uts', label: 'UTS', weight: 22 },
      { id: 'uas', label: 'UAS', weight: 20 },
      { id: 'posttest', label: 'Post-Test Evaluation', weight: 6 },
      { id: 'partisipasi', label: 'Partisipasi dalam kelas', weight: 8 },
    ]
  },
  {
    id: 'msi',
    name: '5. Manajemen Sistem Informasi',
    defaultSks: 3,
    components: [
      { id: 'ti1', label: 'Tugas Individu 1', weight: 10 },
      { id: 'ti2', label: 'Tugas Individu 2', weight: 10 },
      { id: 'tk', label: 'Tugas Kelompok', weight: 20 },
      { id: 'kuis1', label: 'Kuis 1', weight: 5 },
      { id: 'kuis2', label: 'Kuis 2', weight: 5 },
      { id: 'quizizz', label: 'Quizizz', weight: 5 },
      { id: 'diskusi', label: 'Diskusi Kelas', weight: 10 },
      { id: 'uts', label: 'UTS', weight: 17.5 },
      { id: 'uas', label: 'UAS', weight: 17.5 },
    ]
  },
  {
    id: 'sipa',
    name: '6. Sistem Info. Perusahaan & Akuntansi',
    defaultSks: 3,
    components: [
      { id: 'ti', label: 'Tugas Individu', weight: 7 },
      { id: 'tk_erp', label: 'Tugas Kelompok: ERP Implementation', weight: 10 },
      { id: 'ti_lab', label: 'Tugas Individu: Lab Odoo', weight: 8 },
      { id: 'uts', label: 'UTS', weight: 30 },
      { id: 'uas', label: 'UAS', weight: 30 },
      { id: 'partisipasi', label: 'Partisipasi', weight: 7.5 },
      { id: 'pr', label: 'PR Individu', weight: 7.5 },
    ]
  }
];

// Fungsi konversi nilai ke huruf berdasarkan gambar "image_be35b7.png"
const getLetterGrade = (score: number): GradeInfo => {
  if (score >= 85) return { letter: 'A', weight: 4, color: 'text-green-600', bg: 'bg-green-100' };
  if (score >= 80) return { letter: 'A-', weight: 3.7, color: 'text-emerald-600', bg: 'bg-emerald-100' };
  if (score >= 75) return { letter: 'B+', weight: 3.3, color: 'text-blue-600', bg: 'bg-blue-100' };
  if (score >= 70) return { letter: 'B', weight: 3, color: 'text-cyan-600', bg: 'bg-cyan-100' };
  if (score >= 65) return { letter: 'B-', weight: 2.7, color: 'text-indigo-500', bg: 'bg-indigo-50' };
  if (score >= 60) return { letter: 'C+', weight: 2.3, color: 'text-yellow-600', bg: 'bg-yellow-100' };
  if (score >= 55) return { letter: 'C', weight: 2, color: 'text-orange-500', bg: 'bg-orange-50' };
  if (score >= 40) return { letter: 'D', weight: 1, color: 'text-red-500', bg: 'bg-red-100' };
  return { letter: 'E', weight: 0, color: 'text-red-700', bg: 'bg-red-200' };
};

export default function App() {
  const [activeCourseId, setActiveCourseId] = useState('dashboard');
  const [coursesData, setCoursesData] = useState<Course[]>(seedCoursesData);
  const [scores, setScores] = useState<ScoreMatrix>({});
  const [sks, setSks] = useState<SksMap>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialState() {
      try {
        const [coursesResponse, progressResponse] = await Promise.all([
          fetch('/api/courses', {
            cache: 'no-store',
            signal: controller.signal,
          }),
          fetch('/api/progress', {
            cache: 'no-store',
            signal: controller.signal,
          }),
        ]);

        const nextCourses = coursesResponse.ok ? (await coursesResponse.json()) as Course[] : seedCoursesData;
        const progress = progressResponse.ok ? (await progressResponse.json()) as ProgressPayload : { scores: {}, sks: {} };

        setCoursesData(nextCourses);
        setScores(buildInitialScores(nextCourses, progress.scores));
        setSks(buildInitialSks(nextCourses, progress.sks));
        setIsHydrated(true);
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          console.error('Failed to load initial data from Neon:', error);
          setCoursesData(seedCoursesData);
          setScores(buildInitialScores(seedCoursesData));
          setSks(buildInitialSks(seedCoursesData));
          setIsHydrated(true);
        }
      }
    }

    loadInitialState();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isHydrated || coursesData.length === 0) {
      return;
    }

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(async () => {
      try {
        const response = await fetch('/api/progress', {
          method: 'PUT',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scores, sks }),
        });

        if (!response.ok) {
          console.error('Failed to save progress to Neon.');
        }
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          console.error('Failed to save progress to Neon:', error);
        }
      }
    }, 400);

    return () => {
      controller.abort();
      globalThis.clearTimeout(timeout);
    };
  }, [coursesData.length, isHydrated, scores, sks]);

  const handleScoreChange = (courseId: string, compId: string, value: string) => {
    const numValue = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));
    setScores(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [compId]: numValue
      }
    }));
  };

  const handleSksChange = (courseId: string, value: string) => {
     const numValue = value === '' ? 0 : Math.max(0, Number.parseInt(value, 10));
     setSks(prev => ({
       ...prev,
       [courseId]: numValue
     }));
  };

  const calculateTotal = (courseId: string) => {
    if (!scores[courseId]) return 0;
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return 0;
    let total = 0;
    
    course.components.forEach(comp => {
      const score = Number(scores[courseId][comp.id]) || 0;
      total += (score * comp.weight) / 100;
    });
    
    return total;
  };

  const calculateSemesterGPA = () => {
    let totalQualityPoints = 0;
    let totalSks = 0;

    coursesData.forEach(course => {
      const totalScore = calculateTotal(course.id);
      const grade = getLetterGrade(totalScore);
      const courseSks = sks[course.id] || 0;

      // Hanya hitung jika ada SKS
      if (courseSks > 0) {
          totalQualityPoints += grade.weight * courseSks;
          totalSks += courseSks;
      }
    });

    if (totalSks === 0) return { gpa: "0.00", totalSks: 0 };
    return { 
        gpa: (totalQualityPoints / totalSks).toFixed(2),
        totalSks 
    };
  };

  const activeCourse = coursesData.find(c => c.id === activeCourseId);
  const currentTotal = activeCourseId === 'dashboard' ? 0 : calculateTotal(activeCourseId);
  const gradeInfo = activeCourseId === 'dashboard' ? null : getLetterGrade(currentTotal);
  const semesterStats = calculateSemesterGPA();

  const renderDashboard = () => (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* GPA Summary Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl overflow-hidden text-white">
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-xl font-medium text-indigo-100 mb-1">Estimasi Indeks Prestasi Semester</h2>
              <p className="text-indigo-200 text-sm">Berdasarkan data nilai yang telah dimasukkan</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-center">
                  <div className="text-sm text-indigo-200 uppercase tracking-wider font-semibold mb-1">Total SKS</div>
                  <div className="text-3xl font-bold">{semesterStats.totalSks}</div>
               </div>
               <div className="w-px h-16 bg-white/20"></div>
               <div className="text-center">
                  <div className="text-sm text-indigo-200 uppercase tracking-wider font-semibold mb-1">IPS</div>
                  <div className="text-5xl font-black tracking-tight">{semesterStats.gpa}</div>
               </div>
            </div>
          </div>
        </div>

        {/* Courses Summary List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Rekapitulasi Mata Kuliah</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Mata Kuliah</th>
                  <th className="p-4 w-24 text-center">SKS</th>
                  <th className="p-4 w-32 text-center">Nilai Angka</th>
                  <th className="p-4 w-32 text-center">Indeks</th>
                  <th className="p-4 w-32 text-center">Bobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coursesData.map(course => {
                  const total = calculateTotal(course.id);
                  const grade = getLetterGrade(total);
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <button 
                           onClick={() => setActiveCourseId(course.id)}
                           className="text-left font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                        >
                          {course.name.substring(3)}
                        </button>
                      </td>
                      <td className="p-4">
                         <input 
                            type="number"
                            min="1"
                            max="6"
                            value={sks[course.id] || ''}
                            onChange={(e) => handleSksChange(course.id, e.target.value)}
                            className="w-full text-center py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                         />
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-700">{total.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-bold ${grade.bg} ${grade.color}`}>
                          {grade.letter}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-medium">{grade.weight.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Calculator className="w-6 h-6" />
            <span>Kalkulator Nilai</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 rounded-md hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          
          <button
            onClick={() => {
              setActiveCourseId('dashboard');
              setIsSidebarOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 mb-6 rounded-xl text-left transition-all duration-200
              ${activeCourseId === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
            `}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-semibold">Ringkasan Semester</span>
          </button>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
            Input Detail Nilai
          </div>
          <nav className="space-y-1">
            {coursesData.map(course => (
              <button
                key={course.id}
                onClick={() => {
                  setActiveCourseId(course.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-all duration-200
                  ${activeCourseId === course.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100/50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <span className="text-sm font-medium truncate pr-2">{course.name}</span>
                {activeCourseId === course.id && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 lg:p-6 flex items-center shadow-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4 p-2 -ml-2 text-slate-500 rounded-md hover:bg-slate-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
              {activeCourseId === 'dashboard' ? (
                <>
                  <LayoutDashboard className="w-6 h-6 text-indigo-500 hidden sm:block" />
                  Kalkulasi Nilai Akhir Semester (IPS)
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6 text-indigo-500 hidden sm:block" />
                  {activeCourse?.name.substring(3)}
                </>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeCourseId === 'dashboard' 
                ? 'Pantau perolehan IP Semester Anda secara keseluruhan.'
                : 'Masukkan nilai 0-100 untuk setiap komponen evaluasi.'}
            </p>
          </div>
        </header>

        {/* Dynamic Content Area */}
        {activeCourseId === 'dashboard' ? renderDashboard() : (
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-4xl mx-auto flex flex-col xl:flex-row gap-8">
              
              {/* Inputs Section */}
              <div className="flex-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-1">
                    {activeCourse?.components.map((comp, index) => (
                      <div 
                        key={comp.id} 
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${index < activeCourse.components.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50`}
                      >
                        <div className="flex-1">
                          <label htmlFor={`${activeCourse.id}-${comp.id}`} className="block text-sm font-semibold text-slate-700">
                            {comp.label}
                          </label>
                          <div className="text-xs text-slate-500 mt-1 font-medium">Bobot: {comp.weight}%</div>
                        </div>
                        <div className="relative w-full sm:w-40 flex-shrink-0">
                          <input
                            id={`${activeCourse.id}-${comp.id}`}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0 - 100"
                            value={scores[activeCourse.id]?.[comp.id] ?? ''}
                            onChange={(e) => handleScoreChange(activeCourse.id, comp.id, e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none text-sm">
                            / 100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result Section (Sticky) */}
              <div className="w-full xl:w-80 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Estimasi Nilai</h2>
                  </div>

                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-6xl font-black tracking-tight text-slate-800 mb-2">
                      {currentTotal.toFixed(2)}
                    </div>
                    <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                      Total Angka
                    </div>
                  </div>

                  <div className={`mt-6 p-4 rounded-xl flex items-center justify-between ${gradeInfo?.bg}`}>
                    <span className={`font-semibold ${gradeInfo?.color}`}>Prediksi Indeks</span>
                    <div className="text-right">
                       <span className={`text-2xl font-black block ${gradeInfo?.color}`}>{gradeInfo?.letter}</span>
                       <span className={`text-xs font-semibold ${gradeInfo?.color} opacity-80`}>Bobot: {gradeInfo?.weight.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
                    Perhitungan berdasarkan tabel pedoman nilai angka ke huruf. Buka halaman &quot;Ringkasan Semester&quot; untuk melihat IPS.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}