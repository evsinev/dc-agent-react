import * as React from 'react';
import './definition-list.css';

const MAX_COLUMNS = 4;

export interface DefinitionListPair {
  type?: 'pair';
  /** The key label. */
  label: React.ReactNode;
  /** The corresponding value for the key. */
  value: React.ReactNode;
  /** Optional area next to the key to display an info link. */
  info?: React.ReactNode;
  /** Optional id applied to the label element. */
  id?: string;
  className?: string;
}

export interface DefinitionListGroup {
  type: 'group';
  /** Optional title for this column. */
  title?: string;
  items: ReadonlyArray<DefinitionListPair>;
}

export type DefinitionListItem = DefinitionListGroup | DefinitionListPair;

export interface DefinitionListProps {
  /**
   * Number of columns in each grid row. Valid values are integers between 1 and 4.
   * Defaults to 1. Same contract as Cloudscape `KeyValuePairs`.
   */
  columns?: number;
  /** An array of key-value pairs and/or groups (same shape as Cloudscape `KeyValuePairs`). */
  items: ReadonlyArray<DefinitionListItem>;
  ariaLabel?: string;
  ariaLabelledby?: string;
  /** Desired minimum width for each column in pixels. Defaults to 150. */
  minColumnWidth?: number;
  /** Width of the label + leader column (any CSS length). Defaults to 300px. */
  termWidth?: string;
  id?: string;
  className?: string;
  /** Escape hatch, e.g. to override `--definition-list-*` CSS variables. */
  style?: React.CSSProperties;
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Same algorithm as Cloudscape's FlexibleColumnLayout: fit as many columns as `minColumnWidth`
 * allows (capped by `columns`) and, while wrapping into fewer columns than desired, keep the
 * column count even.
 */
export function calculateColumnCount(columns: number, minColumnWidth: number, containerWidth: number | null): number {
  if (!containerWidth) {
    return columns;
  }
  const target = Math.min(columns, Math.floor(containerWidth / minColumnWidth));
  return Math.max(1, target < columns && target % 2 !== 0 ? target - 1 : target);
}

function useContainerWidth<T extends HTMLElement>(): [number | null, React.RefObject<T | null>] {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setWidth(entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [width, ref];
}

function PairRow({ label, value, info, id }: DefinitionListPair) {
  const generatedId = React.useId();
  return (
    <>
      <dt className="definition-list__term">
        <span
          className="definition-list__label"
          id={id || generatedId}
        >
          {label}
        </span>
        {info && <span className="definition-list__info">{info}</span>}
        {/* Empty flex item: its baseline is its own bottom edge, so the dotted border sits
            exactly on the text baseline (bottom-aligned, flush to the label). */}
        <span
          className="definition-list__leader"
          aria-hidden="true"
        />
      </dt>
      <dd className="definition-list__detail">{value}</dd>
    </>
  );
}

function GroupSection({ title, items }: DefinitionListGroup) {
  return (
    <>
      {title && <dt className="definition-list__group-title">{title}</dt>}
      <dd className="definition-list__group-detail">
        <dl className="definition-list__group-list">
          {items.map((pair, index) => (
            <div
              key={index}
              className={cx('definition-list__item', pair.className)}
            >
              <PairRow {...pair} />
            </div>
          ))}
        </dl>
      </dd>
    </>
  );
}

let columnsWarningShown = false;

/**
 * Drop-in replacement for Cloudscape `KeyValuePairs` with the Gravity UI DefinitionList
 * "horizontal" look: `label ······ value` rows with a dotted leader on the text baseline.
 * Responsive column behavior matches Cloudscape (ResizeObserver + even column count rule).
 */
export default function DefinitionList({
  columns = 1,
  items,
  ariaLabel,
  ariaLabelledby,
  minColumnWidth = 150,
  termWidth,
  id,
  className,
  style,
}: DefinitionListProps) {
  const [containerWidth, containerRef] = useContainerWidth<HTMLDListElement>();

  if (process.env.NODE_ENV !== 'production' && columns > MAX_COLUMNS && !columnsWarningShown) {
    columnsWarningShown = true;
    console.warn(`[DefinitionList] columns (${columns}) must be <= ${MAX_COLUMNS}. Using ${MAX_COLUMNS}.`);
  }

  const columnCount = calculateColumnCount(Math.min(columns, MAX_COLUMNS), minColumnWidth, containerWidth);
  const termWidthVar = termWidth ? ({ '--definition-list-term-width': termWidth } as React.CSSProperties) : undefined;

  return (
    <dl
      ref={containerRef}
      id={id}
      className={cx('definition-list', className)}
      style={{ ...style, ...termWidthVar, gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {items.map((item, index) =>
        item.type === 'group' ? (
          <div
            key={index}
            className="definition-list__group"
          >
            <GroupSection {...item} />
          </div>
        ) : (
          <div
            key={index}
            className={cx('definition-list__item', item.className)}
          >
            <PairRow {...item} />
          </div>
        ),
      )}
    </dl>
  );
}
