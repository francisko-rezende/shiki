import type { Element, ElementContent } from 'hast'
import type { TwoSlashRenderers } from './types'

/**
 * An alternative renderer that providers better prefixed class names,
 * with syntax highlight for the info text.
 */
export const rendererRich: TwoSlashRenderers = {
  nodeStaticInfo(info, node) {
    let themedContent: ElementContent[]

    try {
      themedContent = ((this.codeToHast(info.text, {
        ...this.options,
        transformers: [],
        transforms: undefined,
      }).children[0] as Element).children[0] as Element).children
    }
    catch (e) {
      themedContent = [{
        type: 'text',
        value: info.text,
      }]
    }

    return {
      type: 'element',
      tagName: 'span',
      properties: {
        class: 'twoslash-hover',
      },
      children: [
        node,
        {
          type: 'element',
          tagName: 'span',
          properties: {
            class: 'twoslash-hover-info',
          },
          children: themedContent,
        },
      ],
    }
  },

  nodeError(_, node) {
    return {
      type: 'element',
      tagName: 'span',
      properties: {
        class: 'twoslash-error',
      },
      children: [node],
    }
  },

  lineError(error) {
    return [
      {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'twoslash-meta-line twoslash-error-line',
        },
        children: [
          {
            type: 'text',
            value: error.renderedMessage,
          },
        ],
      },
    ]
  },

  lineCompletions(query) {
    return [
      {
        type: 'element',
        tagName: 'div',
        properties: { class: 'twoslash-meta-line twoslash-completions-line' },
        children: [
          { type: 'text', value: ' '.repeat(query.offset) },
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'twoslash-completions' },
            children: [{
              type: 'element',
              tagName: 'ul',
              properties: { },
              children: query.completions!
                .filter(i => i.name.startsWith(query.completionsPrefix || '____'))
                .map(i => ({
                  type: 'element',
                  tagName: 'li',
                  properties: {
                    class: i.kindModifiers?.split(',').includes('deprecated')
                      ? 'deprecated'
                      : undefined,
                  },
                  children: [{
                    type: 'element',
                    tagName: 'span',
                    properties: {},
                    children: [
                      {
                        type: 'element',
                        tagName: 'span',
                        properties: { class: 'twoslash-completions-matched' },
                        children: [
                          {
                            type: 'text',
                            value: query.completionsPrefix || '',
                          },
                        ],
                      },
                      {
                        type: 'text',
                        value: i.name.slice(query.completionsPrefix?.length || 0),
                      },
                    ],
                  }],
                })),
            }],
          },
        ],
      },
    ]
  },

  lineQuery(query, targetNode) {
    if (!query.text)
      return []

    const targetText = targetNode?.type === 'text' ? targetNode.value : ''
    const offset = Math.max(0, (query.offset || 0) + Math.floor(targetText.length / 2) - 1)

    let themedContent: ElementContent[]

    try {
      themedContent = ((this.codeToHast(query.text, {
        ...this.options,
        transformers: [],
        transforms: undefined,
      }).children[0] as Element).children[0] as Element).children
    }
    catch (e) {
      themedContent = [{
        type: 'text',
        value: query.text,
      }]
    }

    return [
      {
        type: 'element',
        tagName: 'div',
        properties: { class: 'twoslash-meta-line twoslash-popover-line' },
        children: [
          { type: 'text', value: ' '.repeat(offset) },
          {
            type: 'element',
            tagName: 'span',
            properties: { class: 'twoslash-popover' },
            children: [
              {
                type: 'element',
                tagName: 'div',
                properties: { class: 'twoslash-popover-arrow' },
                children: [],
              },
              ...themedContent,
            ],
          },
        ],
      },
    ]
  },

  lineCustomTag(tag) {
    return [
      {
        type: 'element',
        tagName: 'div',
        properties: { class: `twoslash-meta-line twoslash-tag-${tag.name}-line` },
        children: [
          {
            type: 'text',
            value: tag.annotation || '',
          },
        ],
      },
    ]
  },
}
