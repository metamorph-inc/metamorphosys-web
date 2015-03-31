'use srict';

angular.module('mms.designEditor.footerDrawer', [])
.directive('footerDrawer', [
	function() {

		function DrawerController() {
		}

		return {
			restrict: 'E',
			controller: DrawerController,
			controllerAs: 'ctrl',
			bindToController: true,
			replace: true,
			transclude: true,
			templateUrl: '/mmsApp/templates/footerDrawer.html',
			require: '^designEditor'
		}
	}
]);