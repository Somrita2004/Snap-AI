
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Sparkles, Zap, Image as ImageIcon } from "lucide-react";
import { generateImage } from "@/lib/dalle";

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [apiKey, setApiKey] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your image");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(prompt, apiKey);
      const newImage: GeneratedImage = {
        url: imageUrl,
        prompt,
        timestamp: new Date(),
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      toast.success("Image generated successfully!");
      setPrompt("");
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate image. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snapai-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SnapAI
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Image Generation</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
              <Zap className="w-3 h-3 mr-1" />
              DALL-E 3 Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* API Key Input */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>OpenAI API Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder="Enter your OpenAI API key (sk-...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="max-w-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Your API key is stored locally and never sent to our servers.
            </p>
          </CardContent>
        </Card>

        {/* Generation Form */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Create Your Image</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the image you want to create... Be creative and detailed!"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !apiKey.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <span>Your Generated Images</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        onClick={() => downloadImage(image.url, image.prompt)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{image.prompt}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Generated {image.timestamp.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Create?</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter your OpenAI API key and describe the image you want to generate. 
                Let your imagination run wild!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
