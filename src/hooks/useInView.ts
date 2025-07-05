import { useEffect, useState, RefObject } from 'react';

/**
 * Simple IntersectionObserver hook to detect when an element enters the viewport
 * @param ref React ref of the element to observe
 * @param rootMargin Optional root margin for IntersectionObserver
 * @returns boolean indicating if the element is in view
 */
const useInView = (ref: RefObject<Element>, rootMargin = '0px'): boolean => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return isIntersecting;
};

export default useInView;
