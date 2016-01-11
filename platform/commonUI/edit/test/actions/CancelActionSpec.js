/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define,describe,it,expect,beforeEach,jasmine*/

define(
    ["../../src/actions/CancelAction"],
    function (CancelAction) {
        "use strict";

        describe("The Cancel action", function () {
            var mockDomainObject,
                mockCapabilities,
                mockEditorCapability,
                mockStatusCapability,
                mockNavigationService,
                actionContext,
                action;

            function mockPromise(value) {
                return {
                    then: function (callback) {
                        return mockPromise(callback(value));
                    }
                };
            }

            beforeEach(function () {
                mockDomainObject = jasmine.createSpyObj(
                    "domainObject",
                    [ "getCapability" ]
                );
                mockEditorCapability = jasmine.createSpyObj(
                    "editor",
                    [ "save", "cancel" ]
                );
                mockStatusCapability = jasmine.createSpyObj(
                    "status",
                    [ "get"]
                );
                mockNavigationService = jasmine.createSpyObj(
                    "navigationService",
                    ["setNavigation"]
                );
                mockCapabilities = {
                    "editor": mockEditorCapability,
                    "status": mockStatusCapability
                };
                actionContext = {
                    domainObject: mockDomainObject
                };

                mockDomainObject.getCapability.andCallFake(function(capability){
                    return mockCapabilities[capability];
                });

                mockEditorCapability.cancel.andReturn(mockPromise(mockDomainObject));
                mockStatusCapability.get.andReturn(true);

                action = new CancelAction( mockNavigationService, actionContext);

            });

            it("only applies to domain object that is being edited", function () {
                expect(CancelAction.appliesTo(actionContext)).toBeTruthy();

                mockStatusCapability.get.andReturn(false);
                expect(CancelAction.appliesTo(actionContext)).toBeFalsy();
            });

            it("invokes the editor capability's cancel functionality when" +
                " performed", function () {
                // Verify precondition
                expect(mockEditorCapability.cancel).not.toHaveBeenCalled();
                action.perform();

                // Should have called cancel
                expect(mockEditorCapability.cancel).toHaveBeenCalled();

                // Definitely shouldn't call save!
                expect(mockEditorCapability.save).not.toHaveBeenCalled();
            });

            it("returns to browse when performed", function () {
                action.perform();
                expect(mockNavigationService.setNavigation).toHaveBeenCalledWith(
                    mockDomainObject
                );
            });
        });
    }
);