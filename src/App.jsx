import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('headers');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response,setResponse]=useState();
  const [darkMode, setDarkMode] = useState(true);

  const handleHeaderChange = (idx, field, value) => {
    const newHeaders = headers.map((h, i) =>
      i === idx ? { ...h, [field]: value } : h
    );
    setHeaders(newHeaders);
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeaderRow = (idx) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!url) return;
    try {
      const headersObj = headers.reduce((acc, h) => {
        if (h.key) acc[h.key] = h.value;
        return acc;
      }, {});
      const options = {
        method,
        headers: headersObj,
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }
      const res = await fetch(url, options);
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    }
  };

  const handleSave = () => {
    const data = {
      url,
      method,
      headers: headers.filter(h => h.key),
      body
    };
    const text = `URL: ${data.url}\nMethod: ${data.method}\nHeaders: ${JSON.stringify(data.headers, null, 2)}\nBody: ${data.body}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'request.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      try {
        // Improved parsing: more robust and error-tolerant
        const urlMatch = text.match(/^URL:\s*(.*)$/m);
        const methodMatch = text.match(/^Method:\s*(.*)$/m);
        const headersMatch = text.match(/^Headers:\s*([\s\S]*?)^Body:/m);
        const bodyMatch = text.match(/^Body:\s*([\s\S]*)/m);
        if (urlMatch) setUrl(urlMatch[1].trim());
        if (methodMatch) setMethod(methodMatch[1].trim().toUpperCase());
        if (headersMatch) {
          let headersStr = headersMatch[1].trim();
          // Remove possible leading/trailing newlines
          headersStr = headersStr.replace(/^\n+|\n+$/g, '');
          // Try to parse headers as JSON, fallback to empty
          let parsedHeaders = [{ key: '', value: '' }];
          try {
            parsedHeaders = JSON.parse(headersStr);
            if (!Array.isArray(parsedHeaders)) parsedHeaders = [{ key: '', value: '' }];
          } catch {
            parsedHeaders = [{ key: '', value: '' }];
          }
          setHeaders(parsedHeaders.length ? parsedHeaders : [{ key: '', value: '' }]);
        }
        if (bodyMatch) setBody(bodyMatch[1].trim());
      } catch (err) {
        alert('Failed to import file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setUrl('');
    setMethod('GET');
    setHeaders([{ key: '', value: '' }]);
    setBody('');
    setResponse();
    setActiveTab('headers');
  };

  return (
    <div className={darkMode ? "flex flex-col p-4 bg-[#121212] min-h-screen" : "flex flex-col p-4 bg-white min-h-screen"}>
      {/* Theme Toggle Button */}
      <div className="flex justify-end mb-2">
        <button
          className={darkMode ? "bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2" : "bg-gray-200 text-black px-4 py-2 rounded flex items-center gap-2 border border-yellow-600"}
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-800" />}
          {darkMode ? "Bright Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Request Form Section */}
      <div className={darkMode ? "bg-[#1e1e1e] p-6 rounded-md shadow-md" : "bg-gray-100 p-6 rounded-md shadow-md"}>
        <div className="flex items-center gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-black text-green-400 font-bold px-3 py-2 rounded-md outline-none"
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL or describe the request to Postbot"
            className={darkMode ? "flex-grow px-4 py-2 rounded-md bg-[#2b2b2b] text-white outline-none placeholder-gray-400" : "flex-grow px-4 py-2 rounded-md bg-white text-black outline-none placeholder-gray-500 border border-gray-300"}
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md"
            onClick={handleSend}
          >
            Send
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-md ml-2"
            onClick={handleSave}
          >
            Save
          </button>
          <label className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-5 py-2 rounded-md ml-2 cursor-pointer">
            Import
            <input type="file" accept=".txt" className="hidden" onChange={handleImport} />
          </label>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md ml-2"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>

        {/* Tabs for Headers/Body */}
        <div className="flex gap-2 mt-6">
          <button
            className={`px-4 py-2 rounded-t-md font-semibold focus:outline-none ${activeTab === 'headers' ? 'bg-[#232323] text-green-400' : 'bg-[#181818] text-gray-400'}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-semibold focus:outline-none ${activeTab === 'body' ? 'bg-[#232323] text-green-400' : 'bg-[#181818] text-gray-400'}`}
            onClick={() => setActiveTab('body')}
          >
            Body
          </button>
        </div>

        {/* Headers Table */}
        {activeTab === 'headers' && (
          <div className={darkMode ? "bg-[#232323] p-4 rounded-b-md" : "bg-gray-200 p-4 rounded-b-md"}>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-1">Key</th>
                  <th className="py-1">Value</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={header.key}
                        onChange={e => handleHeaderChange(idx, 'key', e.target.value)}
                        placeholder="Key"
                        className={darkMode ? "bg-[#2b2b2b] text-white px-2 py-1 rounded w-full" : "bg-white text-black px-2 py-1 rounded w-full border border-gray-300"}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={header.value}
                        onChange={e => handleHeaderChange(idx, 'value', e.target.value)}
                        placeholder="Value"
                        className={darkMode ? "bg-[#2b2b2b] text-white px-2 py-1 rounded w-full" : "bg-white text-black px-2 py-1 rounded w-full border border-gray-300"}
                      />
                    </td>
                    <td>
                      {headers.length > 1 && (
                        <button
                          className="text-red-400 px-2"
                          onClick={() => removeHeaderRow(idx)}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-2 text-blue-400 hover:underline text-sm"
              onClick={addHeaderRow}
            >
              + Add Header
            </button>
          </div>
        )}

        {/* Body Section */}
        {activeTab === 'body' && (
          <div className={darkMode ? "bg-[#232323] p-4 rounded-b-md" : "bg-gray-200 p-4 rounded-b-md"}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Request Body (JSON, form data, etc.)"
              className={darkMode ? "w-full min-h-[100px] px-3 py-2 rounded-md bg-[#2b2b2b] text-white outline-none placeholder-gray-400" : "w-full min-h-[100px] px-3 py-2 rounded-md bg-white text-black outline-none placeholder-gray-500 border border-gray-300"}
            />
          </div>
        )}
      </div>

      {/* Response Section */}
      <div className="mt-8">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Response</h2>
        <div className={darkMode ? "bg-[#1e1e1e] p-4 rounded-md shadow-md w-full overflow-x-auto" : "bg-gray-100 p-4 rounded-md shadow-md w-full overflow-x-auto"}>
          <pre className={darkMode ? "text-green-400 whitespace-pre-wrap break-words w-full" : "text-black whitespace-pre-wrap break-words w-full"}>
            {response && (typeof response === 'object' ? JSON.stringify(response, null, 2) : response)}
          </pre>
        </div>
      </div>
    </div>
  );
}
