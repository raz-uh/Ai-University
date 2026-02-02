'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Hindi' | 'Chinese' | 'Nepali';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    // HUD
    level: { English: 'Level', Spanish: 'Nivel', French: 'Niveau', German: 'Stufe', Hindi: 'स्तर', Chinese: '等级', Nepali: 'स्तर' },
    xp: { English: 'XP', Spanish: 'XP', French: 'XP', German: 'EP', Hindi: 'एक्सपी', Chinese: '经验值', Nepali: 'XP' },
    your_progress: { English: 'Your Progress', Spanish: 'Tu Progreso', French: 'Votre Progrès', German: 'Dein Fortschritt', Hindi: 'आपकी प्रगति', Chinese: '你的进度', Nepali: 'तपाईंको प्रगति' },
    quick_start: { English: 'Quick Start', Spanish: 'Inicio Rápido', French: 'Démarrage Rapide', German: 'Schnellstart', Hindi: 'त्वरित शुरुआत', Chinese: '快速开始', Nepali: 'छिटो सुरु गर्नुहोस्' },
    controls: { English: 'Controls', Spanish: 'Controles', French: 'Contrôles', German: 'Steuerung', Hindi: 'नियन्त्रण', Chinese: '控制', Nepali: 'नियन्त्रणहरू' },
    top_performers: { English: 'Top Performers', Spanish: 'Mejores Estudiantes', French: 'Meilleurs Étudiants', German: 'Top-Performer', Hindi: 'शीर्ष प्रदर्शन करने वाले', Chinese: '顶尖表现者', Nepali: 'शीर्ष प्रदर्शन गर्नेहरू' },

    // Buttons
    start_diagnostic: { English: 'Start Diagnostic', Spanish: 'Iniciar Diagnóstico', French: 'Démarrer le Diagnostic', German: 'Diagnose Starten', Hindi: 'नैदानिक शुरू करें', Chinese: '开始诊断', Nepali: 'नैदानिक सुरु गर्नुहोस्' },
    my_courses: { English: 'My Courses', Spanish: 'Mis Cursos', French: 'Mes Cours', German: 'Meine Kurse', Hindi: 'मेरे पाठ्यक्रम', Chinese: '我的课程', Nepali: 'मेरो पाठ्यक्रम' },
    link_wallet: { English: 'Link Wallet', Spanish: 'Vincular Cartera', French: 'Lier le Portefeuille', German: 'Wallet Verknüpfen', Hindi: 'वॉलेट लिंक करें', Chinese: '关联钱包', Nepali: 'वालेट लिङ्क गर्नुहोस्' },
    immersive_view: { English: 'IMMERSIVE VIEW', Spanish: 'VISTA INMERSIVA', French: 'VUE IMMERSIVE', German: 'IMMERSIVE ANSICHT', Hindi: 'इमर्सिव व्यू', Chinese: '沉浸式视图', Nepali: 'इमर्सिभ दृश्य' },
    show_interface: { English: 'SHOW INTERFACE', Spanish: 'MOSTRAR INTERFAZ', French: 'AFFICHER L\'INTERFACE', German: 'OBERFLÄCHE ZEIGEN', Hindi: 'इंटरफ़ेस दिखाएं', Chinese: '显示界面', Nepali: 'इन्टरफेस देखाउनुहोस्' },

    // Diagnostic
    diagnostic_title: { English: 'AI Diagnostic Interview', Spanish: 'Entrevista de Diagnóstico AI', French: 'Entretien de Diagnostic IA', German: 'KI-Diagnose-Interview', Hindi: 'एआई नैदानिक साक्षात्कार', Chinese: 'AI 诊断访谈', Nepali: 'एआई नैदानिक साक्षात्कार' },
    analyzing: { English: 'Analyzing...', Spanish: 'Analizando...', French: 'Analyse en cours...', German: 'Analysiere...', Hindi: 'विश्लेषण कर रहा है...', Chinese: '正在分析...', Nepali: 'विश्लेषण गर्दै...' },
    submit: { English: 'Submit', Spanish: 'Enviar', French: 'Soumettre', German: 'Senden', Hindi: 'जमा करें', Chinese: '提交', Nepali: 'बुझाउनुहोस्' },

    q1: {
        English: 'What is your current experience level with programming?',
        Spanish: '¿Cuál es tu nivel de experiencia actual en programación?',
        French: 'Quel est votre niveau d\'expérience actuel en programmation ?',
        German: 'Wie ist dein aktuelles Erfahrungsniveau in der Programmierung?',
        Hindi: 'प्रोग्रामिंग के साथ आपका वर्तमान अनुभव स्तर क्या है?',
        Chinese: '你目前的编程经验水平如何？',
        Nepali: 'प्रोग्रामिङमा तपाईंको वर्तमान अनुभव स्तर के हो?'
    },
    q2: {
        English: 'Which learning format helps you understand concepts best?',
        Spanish: '¿Qué formato de aprendizaje te ayuda a entender mejor los conceptos?',
        French: 'Quel format d\'apprentissage vous aide le mieux à comprendre les concepts ?',
        German: 'Welches Lernformat hilft dir am besten, Konzepte zu verstehen?',
        Hindi: 'कौन सा सीखने का प्रारूप आपको अवधारणाओं को सर्वोत्तम रूप से समझने में मदद करता है?',
        Chinese: '哪种学习形式最能帮助你理解概念？',
        Nepali: 'कुन सिकाई ढाँचाले तपाईंलाई अवधारणाहरू राम्रोसँग बुझ्न मद्दत गर्दछ?'
    },
    q3: {
        English: 'What topic are you most interested in learning right now?',
        Spanish: '¿Qué tema te interesa más aprender en este momento?',
        French: 'Quel sujet vous intéresse le plus en ce moment ?',
        German: 'Welches Thema interessiert dich gerade am meisten?',
        Hindi: 'अभी आप किस विषय को सीखने में सबसे अधिक रुचि रखते हैं?',
        Chinese: '你现在最感兴趣的学习话题是什么？',
        Nepali: 'अहिले तपाईं कुन विषय सिक्न सबैभन्दा इच्छुक हुनुहुन्छ?'
    },
    q4: {
        English: 'What is your primary goal (e.g., Career change, personal project)?',
        Spanish: '¿Cuál es tu objetivo principal (ej., cambio de carrera, proyecto personal)?',
        French: 'Quel est votre objectif principal (ex. reconversion, projet personnel) ?',
        German: 'Was ist dein Hauptziel (z. B. Berufswechsel, persönliches Projekt)?',
        Hindi: 'आपका प्राथमिक लक्ष्य क्या है (जैसे, करियर परिवर्तन, व्यक्तिगत परियोजना)?',
        Chinese: '你的主要目标是什么（例如：职业转变、个人项目）？',
        Nepali: 'तपाईंको मुख्य लक्ष्य के हो (जस्तै, करियर परिवर्तन, व्यक्तिगत परियोजना)?'
    },
    q5: {
        English: 'How much time can you realistically dedicate to learning each week?',
        Spanish: '¿Cuánto tiempo puedes dedicar realistamente al aprendizaje cada semana?',
        French: 'Combien de temps pouvez-vous réellement consacrer à l\'apprentissage chaque semaine ?',
        German: 'Wie viel Zeit kannst du realistisch pro Woche für das Lernen aufwenden?',
        Hindi: 'आप वास्तविक रूप से प्रत्येक सप्ताह सीखने के लिए कितना समय समर्पित कर सकते हैं?',
        Chinese: '你每周现实中能投入多少时间学习？',
        Nepali: 'तपाईं हरेक हप्ता सिकाईमा कति समय दिन सक्नुहुन्छ?'
    },

    thinking1: { English: 'Analyzing learning goals...', Spanish: 'Analizando metas...', French: 'Objectifs...', German: 'Ziele...', Hindi: 'लक्ष्य...', Chinese: '解析...', Nepali: 'सिकाई लक्ष्यहरू विश्लेषण गर्दै...' },
    thinking2: { English: 'Curating modules...', Spanish: 'Curando módulos...', French: 'Modules...', German: 'Module...', Hindi: 'मॉड्यूल...', Chinese: '策展...', Nepali: 'मोड्युलहरू क्युरेट गर्दै...' },
    thinking3: { English: 'Finding tutorials...', Spanish: 'Buscando tutoriales...', French: 'Tutoriels...', German: 'Tutorials...', Hindi: 'ट्यूटोरियल...', Chinese: '教程...', Nepali: 'ट्यूटोरियलहरू खोज्दै...' },
    thinking4: { English: 'Optimizing path...', Spanish: 'Optimizando ruta...', French: 'Optimisation...', German: 'Optimierung...', Hindi: 'इष्टतम...', Chinese: '优化...', Nepali: 'पथ अनुकूलन गर्दै...' },

    next: { English: 'Next', Spanish: 'Siguiente', French: 'Suivant', German: 'Weiter', Hindi: 'अगला', Chinese: '下一步', Nepali: 'अगाडि' },
    previous: { English: 'Previous', Spanish: 'Anterior', French: 'Précédent', German: 'Zurück', Hindi: 'पिछला', Chinese: '上一步', Nepali: 'पछाडि' },

    // States
    establishing: { English: 'Establishing rankings...', Spanish: 'Estableciendo clasificaciones...', French: 'Établissement des classements...', German: 'Rangliste wird erstellt...', Hindi: 'रैंकिंग स्थापित की जा रही है...', Chinese: '正在建立排名...', Nepali: 'रैंकिंग स्थापित गर्दै...' },

    // Learning Lab
    lab_title: { English: 'Personalized Learning Lab', Spanish: 'Laboratorio de Aprendizaje Personalizado', French: 'Laboratoire d\'Apprentissage Personnalisé', German: 'Personalisiertes Lernlabor', Hindi: 'व्यक्तिगत शिक्षण प्रयोगशाला', Chinese: '个性化学习实验室', Nepali: 'व्यक्तिगत शिक्षा प्रयोगशाला' },
    syllabi: { English: 'Your Syllabi', Spanish: 'Tus Síलाबोस', French: 'Vos Syllabus', German: 'Deine Lehrpläne', Hindi: 'आपका पाठ्यक्रम', Chinese: '你的课程大纲', Nepali: 'तपाईंको पाठ्यक्रमहरू' },
    no_courses: { English: 'No courses generated yet. Start a diagnostic!', Spanish: 'Aún no se han generado cursos. ¡Inicia un diagnóstico!', French: 'Aucun cours généré pour le moment. Commencez un diagnostic !', German: 'Noch keine Kurse erstellt. Starte eine Diagnose!', Hindi: 'अभी तक कोई पाठ्यक्रम उत्पन्न नहीं हुआ है। नैदानिक शुरू करें!', Chinese: '尚未生成课程。开始诊断！', Nepali: 'अहिलेसम्म कुनै पाठ्यक्रमहरू उत्पन्न भएका छैनन्। नैदानिक सुरु गर्नुहोस्!' },
    select_course: { English: 'Select a course from the sidebar to begin your journey', Spanish: 'Selecciona un curso de la barra lateral para comenzar tu viaje', French: 'Sélectionnez un cours dans la barre latérale pour commencer votre voyage', German: 'Wähle einen Kurs aus der Seitenleiste, um deine Reise zu beginnen', Hindi: 'अपनी यात्रा शुरू करने के लिए साइडबार से एक पाठ्यक्रम चुनें', Chinese: '从侧边栏选择一门课程开始你的旅程', Nepali: 'सुरु गर्न साइडबारबाट पाठ्यक्रम चयन गर्नुहोस्' },
    start_quiz: { English: 'Take Module Quiz & Earn 250 XP', Spanish: 'Tomar Cuestionario del Módulo y Ganar 250 XP', French: 'Passer le Quiz du Module et Gagner 250 XP', German: 'Modul-Quiz machen & 250 EP verdienen', Hindi: 'मॉड्यूल प्रश्नोत्तरी लें और 250 XP अर्जित करें', Chinese: '参加模块测试并赚取 250 经验值', Nepali: 'प्रश्नोत्तरी लिनुहोस् र २५० XP कमाउनुहोस्' }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('English');

    const t = (key: string) => {
        if (!translations[key]) return key;
        return translations[key][language] || translations[key]['English'];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
