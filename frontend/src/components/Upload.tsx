import axios from "axios";
import { useState } from "react"

export default function Upload() {
    
    const [image, setImage] = useState<File | null>(null);
    const [result, setResult] = useState<string>("");
    
    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append("file", image);

        const response = await axios.post(
             "http://127.0.0.1:8000/remove-background",
             formData,
             {responseType: "blob"}
        );

        const imageUrl = URL.createObjectURL(response.data);
        setResult(imageUrl);
    }


    return (
        <div>
            <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            <button onClick={handleUpload}>
                Remove Background
            </button>

            {result && (
                <div>
                    <h3>Result</h3>
                    <img src={result} style={{maxWidth:"400px"}} />
                </div>
            )}
        </div>
    )
}