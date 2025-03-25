import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCircle,
  BrainCircuit,
  Target,
  MessageSquare,
  Upload,
  Building2,
  GraduationCap,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Microscope as Microsoft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService'; // Import authService
import { useNavigate } from 'react-router-dom';

const steps = {
  super_admin: [
    {
      id: 'welcome',
      title: 'Welcome Super Admin',
      description: 'Configure and manage the platform for optimal mentoring experiences.',
      icon: <Users className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['super_admin'],
    },
    {
      id: 'import',
      title: 'Import Employees',
      description: 'Upload your employee data to get started with the platform.',
      icon: <Upload className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['super_admin'],
    },
    {
      id: 'users',
      title: 'Create User Accounts',
      description: 'Set up access for HR, mentors, and mentees.',
      icon: <UserPlus className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['super_admin'],
    },
    {
      id: 'matching',
      title: 'Configure Matching',
      description: 'Define criteria for mentor-mentee matching.',
      icon: <BrainCircuit className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['super_admin'],
    },
  ],
  hr: [
    {
      id: 'welcome',
      title: 'Welcome HR Manager',
      description: 'Oversee and manage mentoring relationships effectively.',
      icon: <Building2 className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['hr'],
    },
    {
      id: 'dashboard',
      title: 'HR Dashboard',
      description: 'Monitor mentoring progress and program effectiveness.',
      icon: <Target className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['hr'],
    },
    {
      id: 'pairs',
      title: 'Manage Pairs',
      description: 'Review and adjust mentor-mentee relationships.',
      icon: <Users className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['hr'],
    },
  ],
  mentor: [
    {
      id: 'welcome',
      title: 'Welcome Mentor',
      description: 'Begin your journey as a mentor and make a difference.',
      icon: <GraduationCap className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentor'],
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Share your expertise and preferences.',
      icon: <UserCircle className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentor'],
    },
    {
      id: 'teams',
      title: 'Connect Microsoft Teams',
      description: 'Enable seamless communication with your mentees.',
      icon: <Microsoft className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentor'],
    },
  ],
  mentee: [
    {
      id: 'welcome',
      title: 'Welcome to Your Journey',
      description: 'Start your mentoring journey for professional growth.',
      icon: <Target className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentee'],
    },
    {
      id: 'profile',
      title: 'Tell Us About Yourself',
      description: 'Share your goals and preferences for better matching.',
      icon: <UserCircle className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentee'],
    },
    {
      id: 'teams',
      title: 'Connect Microsoft Teams',
      description: 'Stay connected with your mentor through Teams.',
      icon: <Microsoft className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentee'],
    },
    {
      id: 'mentor',
      title: 'Meet Your Mentor',
      description: 'Get to know your assigned mentor.',
      icon: <MessageSquare className="w-8 h-8 text-[rgb(230,34,68)]" />,
      roles: ['mentee'],
    },
  ],
};

export default function OnboardingFlow({ role, theme }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    goals: '',
    expertise: '',
    availability: '',
  });
  const navigate = useNavigate();

  const currentSteps = steps[role];
  const isLastStep = currentStep === currentSteps.length - 1;

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const { setHasCompletedOnboarding } = useAuth();

  const handleNext = async () => {
    if (isLastStep) {
      await authService.completeOnboarding(); // Call to update onboarding status
      await authService.completeOnboarding(); // Call to update onboarding status
      setHasCompletedOnboarding(true);
      navigate('/dashboard');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const renderStepContent = (step) => {
    switch (step.id) {
      case 'import':
        return (
          <div className="space-y-4">
            <label className={`block p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'border-white/20 hover:border-white/40' : 'border-slate-300 hover:border-slate-400'}`}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`} />
              <p className={theme === 'dark' ? 'text-white/80' : 'text-slate-600'}>
                {uploadedFile ? uploadedFile.name : 'Drop your employee data file here or click to browse'}
              </p>
            </label>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                Profile Photo
              </label>
              <div className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'border-white/20 hover:border-white/40' : 'border-slate-300 hover:border-slate-400'}`}>
                <UserCircle className={`w-16 h-16 mx-auto mb-2 ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`} />
                <p className={theme === 'dark' ? 'text-white/80' : 'text-slate-600'}>
                  Upload your photo
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:ring-2 focus:ring-[rgb(230,34,68)] focus:border-transparent transition-colors duration-200`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:ring-2 focus:ring-[rgb(230,34,68)] focus:border-transparent transition-colors duration-200`}
              />
            </div>

            {role === 'mentee' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                  Career Goals
                </label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:ring-2 focus:ring-[rgb(230,34,68)] focus:border-transparent transition-colors duration-200`}
                />
              </div>
            )}

            {role === 'mentor' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                    Areas of Expertise
                  </label>
                  <textarea
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:ring-2 focus:ring-[rgb(230,34,68)] focus:border-transparent transition-colors duration-200`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                    Availability
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Tuesdays 2-4pm, Thursdays 10am-12pm"
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'} focus:ring-2 focus:ring-[rgb(230,34,68)] focus:border-transparent transition-colors duration-200`}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div className="flex items-center space-x-4 mb-4">
                <Microsoft className="w-8 h-8 text-[rgb(230,34,68)]" />
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Microsoft Teams Integration
                </h3>
              </div>
              <p className={`mb-6 ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>
                Connect your Microsoft Teams account to enable seamless communication with {role === 'mentor' ? 'mentees' : 'your mentor'}.
              </p>
              <button className="w-full px-6 py-3 bg-[rgb(36,35,92)] text-white rounded-lg hover:bg-[rgb(54,60,90)] transition-colors duration-200 flex items-center justify-center space-x-2">
                <Microsoft className="w-5 h-5" />
                <span>Connect with Microsoft Teams</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1f35] to-slate-900' : 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-[#f0f2f8] to-slate-100'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            {currentSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < currentSteps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep
                    ? 'bg-[rgb(230,34,68)]'
                    : theme === 'dark'
                      ? 'bg-white/10'
                      : 'bg-slate-200'
                    }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className={index === currentStep ? 'text-white' : theme === 'dark' ? 'text-white/60' : 'text-slate-500'}>
                      {index + 1}
                    </span>
                  )}
                </div>
                {index < currentSteps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${index < currentStep
                      ? 'bg-[rgb(230,34,68)]'
                      : theme === 'dark'
                        ? 'bg-white/10'
                        : 'bg-slate-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {currentSteps.map((step, index) => (
              <div
                key={step.id}
                className={`text-sm ${index <= currentStep
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-slate-900'
                  : theme === 'dark'
                    ? 'text-white/40'
                    : 'text-slate-400'
                  }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`relative overflow-hidden rounded-2xl ${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'} border backdrop-blur-xl p-8`}>
          <AnimatePresence initial={false} custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              <div className="flex items-center space-x-4 mb-8">
                {currentSteps[currentStep].icon}
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {currentSteps[currentStep].title}
                  </h2>
                  <p className={theme === 'dark' ? 'text-white/80' : 'text-slate-600'}>
                    {currentSteps[currentStep].description}
                  </p>
                </div>
              </div>

              {renderStepContent(currentSteps[currentStep])}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  className="group relative px-6 py-3 bg-[rgb(230,34,68)] text-white rounded-lg hover:bg-[rgb(229,85,79)] transition-all duration-200"
                >
                  <div className="absolute -inset-1 bg-[rgb(230,34,68)] rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative flex items-center space-x-2">
                    <span>{isLastStep ? 'Complete' : 'Continue'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
OnboardingFlow.propTypes = {
  role: PropTypes.oneOf(['super_admin', 'hr', 'mentor', 'mentee']).isRequired,
  theme: PropTypes.oneOf(['dark', 'light']).isRequired
};
