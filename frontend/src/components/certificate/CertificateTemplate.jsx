import React, { forwardRef } from 'react';
import { Award } from 'lucide-react';

export const CertificateTemplate = forwardRef(({
    studentName,
    courseName,
    instructorName,
    date,
    certificateId
}, ref) => {
    return (
        <div ref={ref} className="w-[800px] h-[600px] bg-[#fdfbf7] p-8 text-center relative border-[16px] border-[#1e293b] mx-auto flex flex-col justify-center items-center font-serif text-[#1e293b]" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            {/* Ornamental Border */}
            <div className="absolute inset-4 border-2 border-[#caa45f]" style={{ opacity: 0.5, pointerEvents: 'none' }}></div>
            <div className="absolute inset-6 border border-[#caa45f]" style={{ opacity: 0.3, pointerEvents: 'none' }}></div>

            {/* Corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#caa45f]"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#caa45f]"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#caa45f]"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#caa45f]"></div>

            {/* Header */}
            <div className="mb-2">
                <Award className="w-16 h-16 text-[#caa45f] mx-auto mb-4" />
                <h1 className="text-5xl font-bold tracking-wider uppercase text-[#1e293b] mb-2">Certificate</h1>
                <h2 className="text-xl tracking-[0.2em] text-[#caa45f] uppercase">of Completion</h2>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center w-full max-w-2xl">
                <p className="text-lg italic text-[#64748b] mb-6">This is to certify that</p>

                <h3 className="text-4xl font-bold font-script text-[#1e293b] mb-2 border-b-2 border-[#caa45f] pb-4 mx-12">
                    {studentName}
                </h3>

                <p className="text-lg italic text-[#64748b] my-6">has successfully completed the course</p>

                <h4 className="text-3xl font-bold text-[#1e293b] mb-12">
                    {courseName}
                </h4>

                {/* Signatures */}
                <div className="flex justify-between items-end px-12 mt-auto">
                    <div className="text-center">
                        <div className="w-48 border-b border-[#94a3b8] mb-2 pb-1 font-script text-xl">
                            {instructorName}
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#64748b]">Instructor</p>
                    </div>

                    <div className="text-center">
                        <div className="w-32 h-32 absolute bottom-12 left-1/2 -translate-x-1/2" style={{ opacity: 0.1 }}>
                            <Award className="w-full h-full text-[#caa45f]" />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="w-48 border-b border-[#94a3b8] mb-2 pb-1 text-lg">
                            {new Date(date).toLocaleDateString()}
                        </div>
                        <p className="text-xs uppercase tracking-wider text-[#64748b]">Date</p>
                    </div>
                </div>
            </div>

            {/* ID */}
            <div className="absolute bottom-2 right-4 text-[10px] text-[#94a3b8] font-mono">
                ID: {certificateId}
            </div>
        </div>
    );
});

CertificateTemplate.displayName = 'CertificateTemplate';
