import { useRef, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { CertificateTemplate } from './CertificateTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createPortal } from 'react-dom';

export const CertificateModal = ({ isOpen, onClose, data }) => {
    const certificateRef = useRef(null); // Ref for the visible preview (if needed later)
    const downloadRef = useRef(null);    // Ref for the high-quality capture
    const [downloading, setDownloading] = useState(false);

    if (!isOpen || !data) return null;

    const handleDownload = async () => {
        try {
            setDownloading(true);

            // Wait a moment for the off-screen element to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!downloadRef.current) {
                console.error("Download ref not found");
                alert("Internal Error: Certificate element not found. Please try again.");
                return;
            }

            console.log("Starting HTML2Canvas...");
            const canvas = await html2canvas(downloadRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: true,
                backgroundColor: '#fdfbf7',
                allowTaint: true,
                // Removed foreignObjectRendering as it sometimes causes issues
            });
            console.log("Canvas created successfully");

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [800, 600]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
            const safeName = (data.courseName || 'certificate').replace(/[^a-z0-9]/gi, '-').toLowerCase();
            pdf.save(`certificate-${safeName}.pdf`);
            console.log("PDF download triggered");

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Error downloading certificate: ${error.message || 'Unknown error'}`);
        } finally {
            setDownloading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Off-screen container for capture - positioned fixed to avoid layout shifts */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
                <CertificateTemplate ref={downloadRef} {...data} />
            </div>

            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-900">Certificate Preview</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content - Visible Preview */}
                <div className="p-8 bg-slate-100 overflow-auto max-h-[80vh] flex justify-center">
                    <div className="transform scale-[0.6] md:scale-[0.7] lg:scale-[0.85] origin-top">
                        <CertificateTemplate ref={certificateRef} {...data} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end p-4 border-t bg-white gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-[#caa45f] hover:bg-[#b8934e] text-white border-0"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
