interface AncientQueryCarouselProps {
  displayedText: string;
  onQueryClick: () => void;
}

export const AncientQueryCarousel = ({ displayedText, onQueryClick }: AncientQueryCarouselProps) => (
  <div className="ancient-query-carousel" onClick={onQueryClick}>
    <div className="query-text">
      {displayedText}
    </div>
  </div>
);