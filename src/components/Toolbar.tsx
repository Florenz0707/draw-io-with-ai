/**
 * Toolbar 组件
 * 提供绘图编辑工具栏
 */

import React, { useState } from 'react';
import type { DrawingCanvasRef } from './DrawingCanvas';
import type { GraphData } from '../utils/graphDataConverter';
import { callAIService, generateAIPrompt, validateAIResponse } from '../services/aiService';
import './Toolbar.css';

interface ToolbarProps {
  canvasRef: React.RefObject<DrawingCanvasRef>;
}

const Toolbar: React.FC<ToolbarProps> = ({ canvasRef }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 导出为JSON
  const handleExport = () => {
    if (!canvasRef.current) return;

    try {
      const data = canvasRef.current.getGraphData();
      const json = JSON.stringify(data, null, 2);

      // 下载文件
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagram_${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showMessage('图表已导出为JSON文件', 'success');
    } catch (error) {
      showMessage(`导出失败: ${error}`, 'error');
    }
  };

  // 导入JSON文件
  const handleImport = async () => {
    if (!canvasRef.current) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as GraphData;
          canvasRef.current?.importGraphData(data);
          showMessage('图表已导入', 'success');
        } catch (error) {
          showMessage(`导入失败: ${error}`, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 调用AI处理
  const handleAIProcess = async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      const graphData = canvasRef.current.getGraphData();

      if (graphData.cells.length === 0) {
        showMessage('请先在编辑器中绘制图表', 'error');
        setIsLoading(false);
        return;
      }

      const prompt = generateAIPrompt(graphData);

      // 调用AI服务
      const response = await callAIService({
        diagram: graphData,
        prompt,
      });

      if (!validateAIResponse(response)) {
        showMessage('AI响应数据格式无效', 'error');
        setIsLoading(false);
        return;
      }

      // 导入AI返回的数据
      canvasRef.current.importGraphData(response.diagram);

      showMessage(`AI处理成功: ${response.description}`, 'success');

      // 显示修改内容
      if (response.modifications && response.modifications.length > 0) {
        console.log('AI修改内容:', response.modifications);
      }
    } catch (error) {
      showMessage(`AI处理失败: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 清空图表
  const handleClear = () => {
    if (!canvasRef.current) return;

    if (window.confirm('确定要清空所有图表内容吗？')) {
      canvasRef.current.clear();
      showMessage('图表已清空', 'success');
    }
  };

  // 撤销
  const handleUndo = () => {
    if (!canvasRef.current) return;
    canvasRef.current.undo();
    showMessage('已撤销', 'info');
  };

  // 重做
  const handleRedo = () => {
    if (!canvasRef.current) return;
    canvasRef.current.redo();
    showMessage('已重做', 'info');
  };

  // 获取当前图表JSON
  const handleGetJSON = () => {
    if (!canvasRef.current) return;

    try {
      const data = canvasRef.current.getGraphData();
      const json = JSON.stringify(data, null, 2);

      // 复制到剪贴板
      navigator.clipboard.writeText(json).then(() => {
        showMessage('JSON已复制到剪贴板', 'success');
      }).catch(() => {
        // 如果剪贴板复制失败，显示在console
        console.log('Current Graph JSON:', json);
        showMessage('JSON已输出到控制台', 'info');
      });
    } catch (error) {
      showMessage(`获取JSON失败: ${error}`, 'error');
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className="toolbar-btn"
          title="导出图表为JSON文件"
        >
          📥 导出JSON
        </button>
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="toolbar-btn"
          title="从JSON文件导入图表"
        >
          📤 导入JSON
        </button>
        <button
          onClick={handleGetJSON}
          disabled={isLoading}
          className="toolbar-btn"
          title="获取当前图表的JSON数据"
        >
          📋 获取JSON
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={handleAIProcess}
          disabled={isLoading}
          className="toolbar-btn toolbar-btn-primary"
          title="使用AI处理和优化图表"
        >
          {isLoading ? '⏳ 处理中...' : '🤖 AI处理'}
        </button>
      </div>

      <div className="toolbar-group">
        <button
          onClick={handleUndo}
          disabled={isLoading}
          className="toolbar-btn"
          title="撤销上一步操作"
        >
          ↶ 撤销
        </button>
        <button
          onClick={handleRedo}
          disabled={isLoading}
          className="toolbar-btn"
          title="重做上一步操作"
        >
          ↷ 重做
        </button>
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="toolbar-btn toolbar-btn-danger"
          title="清空所有图表内容"
        >
          🗑️ 清空
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
