/**
 * AI服务接口层
 * 定义AI调用接口和数据结构
 */

import type { GraphData } from '../utils/graphDataConverter';

export interface AIRequest {
  diagram: GraphData;
  prompt: string;
}

export interface AIResponse {
  diagram: GraphData;
  description: string;
  modifications?: string[];
}

/**
 * 调用AI服务处理图表
 * @param request AI请求数据
 * @returns AI返回的优化后的图表数据
 */
export async function callAIService(request: AIRequest): Promise<AIResponse> {
  // 这是一个接口定义，实际实现需要连接到真实的AI服务
  // 例如：OpenAI API、本地LLM服务等

  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 返回示例数据：简单的自动调整（模拟AI处理）
      resolve({
        diagram: request.diagram,
        description: 'AI处理了您的图表。这是一个演示响应。',
        modifications: ['自动对齐了图表', '优化了连接线样式'],
      });
    }, 1000);
  });
}

/**
 * 生成发送给AI的提示词
 */
export function generateAIPrompt(diagramData: GraphData): string {
  return `
请分析并优化以下draw.io图表数据：

图表包含 ${diagramData.cells.length} 个元素

请返回优化后的JSON格式数据，结构如下：
{
  "diagram": {
    "cells": [
      {
        "id": "string",
        "type": "vertex" | "edge",
        "value": "string",
        "geometry": { "x": number, "y": number, "width": number, "height": number },
        "style": { ... },
        "source": "string (for edges)",
        "target": "string (for edges)"
      }
    ],
    "viewport": { "scale": number, "translate": { "x": number, "y": number } }
  },
  "description": "简单描述您的优化",
  "modifications": ["修改1", "修改2", ...]
}
  `;
}

/**
 * 验证AI返回的数据结构
 */
export function validateAIResponse(response: any): response is AIResponse {
  return (
    response &&
    response.diagram &&
    Array.isArray(response.diagram.cells) &&
    typeof response.description === 'string'
  );
}
