# jsHelpers
A place for archiving whatever JavaScript functions and classes I come up with for web dev related issues.

Currently containing:

RangeMapper, a class that runs automatically upon instantiation, it maps the screen width (window.innerWidth) to any chosen range of numbers, which are applied to css attributes as the screen width changes. can be limited to a range of screen sizes. Daisy chaining RangeMappers (for having different ranges on the same css attribute of the same element that are applied at different screen widths) is a feature that is intended to be added in the future.
