# Change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.1] - 2016-12-25
### Added
- `addFormat()` as an alias for AJV's `addFormat()`.

## [1.0.0] - 2016-12-24
### Changed
- Export generic `Validator` class.
- Refactor entire library to export `queryValidator` and `bodyValidator` validators which are instances of the new `Validator`. These two instances replace the functions `addBodySchema`, `addQuerySchema`, `validateBody` and `validateQuery`.
- Updated readme

### Added
- `addKeyword()` as an alias for AJV's `addKeyword()`.
- Initial test setup for `bodyValidator`

## [0.2.3] - 2016-10-14
### Added
- Keyword `sortOptions`
- Test suite

## [0.2.2] - 2016-07-03
### Changed

- Renamed @nielskrijger/ajv-validate to @yahapi/ajv-validate
- Updated readme

# Prior versions

Changes not documented
