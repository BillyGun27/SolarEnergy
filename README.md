### Required
1. PHP 7+
2. Composer (optional)

### How To Use
1. Download or clone in your local server
2. Put in the root folder or sub-folder in your local server
3. Config file `.htaccess` in that folder
	- change it if in the root folder `RewriteBase /App/Controller/Route`
	- change it if in the sub-folder `RewriteBase /your-sub-folder/App/Controller/Route`

4. Config file `config.php` in that folder

+ Setting timezone (default setting)

```php
	'timezone' => date_default_timezone_set('Asia/Jakarta')
```
+ Setting token (default setting)

```php
	'token' => [
		'expired' => [
			'hours' => 1,
			'minutes' => 0,
			'seconds' => 0,
		],

		'key' => 'your secret key for token'
	]
```
+ Setting database, read [MORE](https://gitlab.com/9nine9/frest-api/wikis/migration/refresh)

```php
	'db' => [
		'driver' => 'mysql',
		'host' => 'localhost',
		'port' => '3306',
		'username' => 'root',
		'password' => '',
		'dbname' => 'your database name'
	]
```
+ Setting migration, read [MORE](https://gitlab.com/9nine9/frest-api/wikis/migration/refresh)

```php
	'migration' => [
		'secret_code' => 'your secret code for migration'	
	]
```
+ Setting path (if in the root folder)

```php
	'path' => [
		'app' => '',
		'url' => 'http://' . $_SERVER['HTTP_HOST'] . ''
	]
```
+ Setting path (if in the sub-folder)

```php
	'path' => [
		'app' => '/your-sub-folder',
		'url' => 'http://' . $_SERVER['HTTP_HOST'] . '/your-sub-folder'
	]
```

__DONE__