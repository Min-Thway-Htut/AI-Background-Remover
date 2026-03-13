import axios from "axios";
import { useState } from "react";
import "./Upload.css";

export default function Upload() {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [dragActive, setDragActive] = useState<boolean>(false);
    
    const handleFileChange = (file: File | null) => {
        if (file) {
            if (file.type.startsWith('image/')) {
                setImage(file);
                setError("");
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setError("Please upload a valid image file");
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleUpload = async () => {
        if (!image) {
            setError("Please select an image first");
            return;
        }

        setLoading(true);
        setError("");
        setResult("");

        try {
            const formData = new FormData();
            formData.append("file", image);

            const response = await axios.post(
                "http://127.0.0.1:8000/remove-background",
                formData,
                { responseType: "blob" }
            );

            if (response.status === 200) {
                const imageUrl = URL.createObjectURL(response.data);
                setResult(imageUrl);
            } else {
                setError("Failed to process image");
            }
        } catch (err) {
            setError("An error occurred while processing your image");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (result) {
            const link = document.createElement('a');
            link.href = result;
            link.download = `background-removed-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleReset = () => {
        setImage(null);
        setPreview("");
        setResult("");
        setError("");
    };

    return (
        <div className="upload-container">
            <div className="upload-header">
                <h1>AI Background Remover</h1>
                <p className="subtitle">Upload your image and remove the background instantly</p>
            </div>

            <div className="upload-content">
                {/* Upload Area */}
                {!preview && (
                    <div 
                        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            type="file"
                            id="file-input"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                        <label htmlFor="file-input" className="upload-label">
                            <div className="upload-icon">
                                <svg viewBox="0 0 24 24" width="48" height="48">
                                    <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                                </svg>
                            </div>
                            <div className="upload-text">
                                <span className="primary-text">Click to upload</span>
                                <span className="secondary-text">or drag and drop</span>
                            </div>
                            <span className="file-types">PNG, JPG, JPEG up to 10MB</span>
                        </label>
                    </div>
                )}

                {/* Preview Area */}
                {preview && (
                    <div className="preview-section">
                        <div className="image-comparison">
                            <div className="image-card original">
                                <div className="image-header">
                                    <span>Original</span>
                                    <button onClick={handleReset} className="reset-btn">
                                        <svg viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                        </svg>
                                    </button>
                                </div>
                                <img src={preview} alt="Original" className="preview-image" />
                            </div>

                            {result && (
                                <div className="image-card result">
                                    <div className="image-header">
                                        <span>Result</span>
                                    </div>
                                    <img src={result} alt="Result" className="preview-image" />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {!result && !loading && (
                                <button 
                                    onClick={handleUpload} 
                                    className="primary-btn"
                                    disabled={loading}
                                >
                                    Remove Background
                                </button>
                            )}

                            {loading && (
                                <div className="processing">
                                    <div className="spinner"></div>
                                    <span>Processing your image...</span>
                                </div>
                            )}

                            {result && (
                                <button 
                                    onClick={handleDownload} 
                                    className="download-btn"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                    </svg>
                                    Download Result
                                </button>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}