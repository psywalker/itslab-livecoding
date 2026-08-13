import type { HTMLAttributes } from "react";
import { useState, useRef, useLayoutEffect } from "react";
import { menuItems } from "./data";
import { MenuItem } from "./MenuItem";
import "./Menu.css";
import { Dropdown } from "./Dropdown";

interface MenuProps extends HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export const Menu = ({ className, ...htmlAttrs }: MenuProps) => {
  const [visibleCount, setVisibleCount] = useState(menuItems.length);

  const munuRef = useRef<HTMLUListElement | null>(null);
  const measureRef = useRef<HTMLUListElement | null>(null);
  const visibleItems = menuItems.slice(0, visibleCount);
  const hiddenItems = menuItems.slice(visibleCount);

  const calculateVisibleItems = () => {
    const menuElement = munuRef.current;
    const measureElement = measureRef.current;

    if (!menuElement || !measureElement) return;
    const menuWidth = menuElement.clientWidth;
    const children = Array.from(measureElement.children) as HTMLElement[];
    const dropdownElement = children[children.length - 1];
    const itemsElements = children.slice(0, - 1);
    const dropdownWidth = dropdownElement.offsetWidth ?? 0;    
    const styles = window.getComputedStyle(measureElement);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

    let usedWidth = dropdownWidth;
    let nextVisibleCount = 0;

    for (const itemElement of itemsElements) {
      const itemWidth = itemElement.offsetWidth;
      const gapBeforeItem = nextVisibleCount === 0 ? 0 : gap;
      const gapBeforeDropdown = gap;
      const nextWidth = usedWidth + itemWidth + gapBeforeItem + gapBeforeDropdown;

      if (nextWidth <= menuWidth) {
        usedWidth += gapBeforeItem + itemWidth;
        nextVisibleCount++;
      } else {
        break;
      }
    }

    setVisibleCount(nextVisibleCount);
  };

  useLayoutEffect(() => {
    calculateVisibleItems();

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleItems();
    });
    
    if (munuRef.current) {
      resizeObserver.observe(munuRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    }
  }, []);

  return (
    <>
      <ul 
        className={`Menu ${className ?? ""}`} 
        {...htmlAttrs} 
        ref={munuRef}
      >
        {visibleItems.map((menuItem) => (
          <MenuItem key={menuItem.id} menuItem={menuItem} />
        ))}

        <Dropdown menuItems={hiddenItems} />
      </ul>
        
      <ul
        className="Menu Menu--measure"
        ref={measureRef}
        aria-hidden="true"
      >
        {menuItems.map((menuItem) => (
          <MenuItem key={menuItem.id} menuItem={menuItem} />
        ))}

        <Dropdown menuItems={menuItems} />
      </ul>
    </>
  );
};
